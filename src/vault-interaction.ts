import { Address, log, ethereum, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { Transfer as TransferEvent, IERC20 as IERC20Contract } from "../generated/templates/BeefyVaultV7/IERC20"
import { getBeefyStrategy, getBeefyVault, isVaultInitialized } from "./entity/vault"
import { ZERO_BD, ZERO_BI, tokenAmountToDecimal } from "./utils/decimal"
import { getTokenAndInitIfNeeded } from "./entity/token"
import { SHARE_TOKEN_MINT_ADDRESS, BURN_ADDRESS } from "./config"
import { getChainVaults, isBoostAddress, isRewardPoolAddress } from "./vault-config-asm"
import { getInvestor } from "./entity/investor"
import { getInvestorPosition } from "./entity/position"
import { BeefyVault, Investor } from "../generated/schema"
import { getVaultTokenBreakdown } from "./platform"
import { getInvestorPositionBalanceBreakdown, getVaultBalanceBreakdown, saveVaultBalanceBreakdownUpdateEvent } from "./entity/breakdown"
import { getClockTick } from "./entity/clock"
import { HOUR } from "./utils/time"
import { TokenBalance } from "./platform/common"
import { Multicall3Params, multicall } from "./utils/multicall"
import { getBeefyRewardPool } from "./entity/reward-pool"

export function handleRewardPoolTransfer(event: TransferEvent): void {
  // a transfer of a reward pool token is equivalent to a transfer of the vault token
  // from the investor's perspective
  const rewardPool = getBeefyRewardPool(event.address)
  const vault = getBeefyVault(rewardPool.vault)
  _handleTransfer(event.block, vault, event.params.from, event.params.to, event.params.value, event.transaction.hash)
}

export function handleVaultTransfer(event: TransferEvent): void {
  const vault = getBeefyVault(event.address)
  _handleTransfer(event.block, vault, event.params.from, event.params.to, event.params.value, event.transaction.hash)
}

function _handleTransfer(block: ethereum.Block, vault: BeefyVault, from: Address, to: Address, value: BigInt, transactionHash: Bytes): void {
  // transfer to self
  if (from.equals(to)) {
    log.warning("handleVaultTransfer: transfer to self {}", [transactionHash.toHexString()])
    return
  }

  /// value is zero
  if (value.equals(ZERO_BI)) {
    log.warning("handleVaultTransfer: zero value transfer {}", [transactionHash.toHexString()])
    return
  }

  // ignore transfers from/to boosts
  if (isBoostAddress(from)) {
    log.warning("handleVaultTransfer: transfer from boost {}", [from.toHexString()])
    return
  }
  if (isBoostAddress(to)) {
    log.warning("handleVaultTransfer: transfer to boost {}", [to.toHexString()])
    return
  }

  if (!isVaultInitialized(vault)) {
    log.warning("handleVaultTransfer: vault is not initialized {}", [vault.id.toHexString()])
    return
  }

  updateVaultData(vault)

  if (!from.equals(SHARE_TOKEN_MINT_ADDRESS) && !from.equals(BURN_ADDRESS) && !isRewardPoolAddress(from)) {
    const investorAddress = from
    const investor = getInvestor(investorAddress)
    investor.save()
    updateInvestorVaultData(vault, investor)
  }

  if (!to.equals(SHARE_TOKEN_MINT_ADDRESS) && !to.equals(BURN_ADDRESS) && !isRewardPoolAddress(to)) {
    const investorAddress = to
    const investor = getInvestor(investorAddress)
    investor.save()
    updateInvestorVaultData(vault, investor)
  }

  updateVaultBreakDown(block, vault)
}

export function handleStrategyHarvest(event: ethereum.Event): void {
  let strategy = getBeefyStrategy(event.address)
  let vault = getBeefyVault(strategy.vault)
  if (!isVaultInitialized(vault)) {
    log.warning("handleStrategyHarvest: vault is not initialized {}", [vault.id.toHexString()])
    return
  }

  updateVaultData(vault)
  updateVaultBreakDown(event.block, vault)
}

export function handleClockTick(block: ethereum.Block): void {
  let tickRes = getClockTick(block, HOUR)
  if (!tickRes.isNew) {
    log.debug("handleClockTick: tick already exists for that hour block", [])
    return
  }
  tickRes.tick.save()

  const vaultConfigs = getChainVaults()
  for (let i = 0; i < vaultConfigs.length; i++) {
    const vaultConfig = vaultConfigs[i]
    const vault = getBeefyVault(vaultConfig.address)
    if (!isVaultInitialized(vault)) {
      log.debug("handleClockTick: vault is not initialized {}", [vault.id.toHexString()])
      continue
    }
    updateVaultData(vault) // we need the latest data before updating the breakdown
    updateVaultBreakDown(block, vault)
  }
}

function updateInvestorVaultData(vault: BeefyVault, investor: Investor): Investor {
  const investorAddress = Address.fromBytes(investor.id)
  const rewardPools = vault.rewardPools.load()

  let rawSharesBalance = ZERO_BI

  const vaultContract = IERC20Contract.bind(Address.fromBytes(vault.id))
  rawSharesBalance = rawSharesBalance.plus(vaultContract.balanceOf(investorAddress))

  for (let i = 0; i < rewardPools.length; i++) {
    const rewardPool = rewardPools[i]
    const rewardPoolContract = IERC20Contract.bind(Address.fromBytes(rewardPool.id))
    rawSharesBalance = rawSharesBalance.plus(rewardPoolContract.balanceOf(investorAddress))
  }

  // get the new investor deposit value
  const sharesToken = getTokenAndInitIfNeeded(vault.sharesToken)
  const investorShareTokenBalance = tokenAmountToDecimal(rawSharesBalance, sharesToken.decimals)

  ///////
  // update investor positions
  const position = getInvestorPosition(vault, investor)
  position.rawSharesBalance = rawSharesBalance
  position.sharesBalance = investorShareTokenBalance
  position.save()

  return investor
}

function updateVaultData(vault: BeefyVault): BeefyVault {
  const underlyingToken = getTokenAndInitIfNeeded(vault.underlyingToken)
  const sharesToken = getTokenAndInitIfNeeded(vault.sharesToken)

  ///////
  // fetch data on chain
  const signatures = [new Multicall3Params(vault.id, "totalSupply()", "uint256")]
  const results = multicall(signatures)
  const vaultSharesTotalSupplyRaw = results[0].value.toBigInt()

  ///////
  // compute derived values
  const vaultSharesTotalSupply = tokenAmountToDecimal(vaultSharesTotalSupplyRaw, sharesToken.decimals)

  ///////
  // update vault entities
  vault.rawSharesTokenTotalSupply = vaultSharesTotalSupplyRaw
  vault.sharesTokenTotalSupply = vaultSharesTotalSupply
  vault.save()

  return vault
}

function updateVaultBreakDown(block: ethereum.Block, vault: BeefyVault): BeefyVault {
  // update breakdown of tokens in the vault
  const breakdown = getVaultTokenBreakdown(vault)
  saveVaultBalanceBreakdownUpdateEvent(vault, block)

  // also add the share token and underlying token to the breakdown
  // so we are also computing time weighted balance for those
  let foundSharesToken = false
  for (let i = 0; i < breakdown.length; i++) {
    if (breakdown[i].tokenAddress.equals(vault.sharesToken)) {
      foundSharesToken = true
    }
  }
  if (!foundSharesToken) {
    breakdown.push(new TokenBalance(vault.sharesToken, vault.rawSharesTokenTotalSupply))
  }
  // save the vault balance breakdown
  for (let i = 0; i < breakdown.length; i++) {
    const tokenBalance = breakdown[i]
    const token = getTokenAndInitIfNeeded(tokenBalance.tokenAddress)

    // now the balance breakdown
    const breakdownItem = getVaultBalanceBreakdown(vault, token)
    breakdownItem.rawBalance = tokenBalance.rawBalance
    breakdownItem.balance = tokenAmountToDecimal(tokenBalance.rawBalance, token.decimals)
    breakdownItem.lastUpdateTimestamp = block.timestamp
    breakdownItem.lastUpdateBlock = block.number
    breakdownItem.save()
  }

  // also update the investor positions for that token
  const positions = vault.positions.load()

  for (let i = 0; i < breakdown.length; i++) {
    const tokenBalance = breakdown[i]
    const token = getTokenAndInitIfNeeded(tokenBalance.tokenAddress)
    const breakdownItem = getVaultBalanceBreakdown(vault, token)

    for (let j = 0; j < positions.length; j++) {
      const position = positions[j]
      const positionBreakdownItem = getInvestorPositionBalanceBreakdown(position, token)

      // compute time weighted balance contribution
      let rawTimeWeightedBalanceContribution = ZERO_BI
      let timeWeightedBalanceContribution = ZERO_BD
      const previousRawBalance = positionBreakdownItem.rawBalance
      const previousBalance = positionBreakdownItem.balance
      const secondsSinceLastUpdate = block.timestamp.minus(positionBreakdownItem.lastUpdateTimestamp)
      if (secondsSinceLastUpdate.gt(ZERO_BI) && previousRawBalance.gt(ZERO_BI)) {
        rawTimeWeightedBalanceContribution = previousRawBalance.times(secondsSinceLastUpdate)
        timeWeightedBalanceContribution = previousBalance.times(secondsSinceLastUpdate.toBigDecimal())
      }

      // compute the position balance breakdown
      let rawInvestorTokenBalance = ZERO_BI
      let investorTokenBalance = ZERO_BD
      if (!vault.rawSharesTokenTotalSupply.equals(ZERO_BI)) {
        const investorPercentOfTotal = position.sharesBalance.div(vault.sharesTokenTotalSupply)
        investorTokenBalance = breakdownItem.balance.times(investorPercentOfTotal)
        rawInvestorTokenBalance = position.rawSharesBalance.times(breakdownItem.rawBalance).div(vault.rawSharesTokenTotalSupply)
      }

      // only update if something changed
      if (positionBreakdownItem.rawBalance.equals(rawInvestorTokenBalance) && rawTimeWeightedBalanceContribution.equals(ZERO_BI)) {
        continue
      }

      positionBreakdownItem.rawBalance = rawInvestorTokenBalance
      positionBreakdownItem.balance = investorTokenBalance
      positionBreakdownItem.rawTimeWeightedBalance = positionBreakdownItem.rawTimeWeightedBalance.plus(rawTimeWeightedBalanceContribution)
      positionBreakdownItem.timeWeightedBalance = positionBreakdownItem.timeWeightedBalance.plus(timeWeightedBalanceContribution)
      positionBreakdownItem.lastUpdateTimestamp = block.timestamp
      positionBreakdownItem.lastUpdateBlock = block.number
      positionBreakdownItem.save()
    }
  }

  return vault
}
