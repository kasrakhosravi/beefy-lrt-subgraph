import { Address, log, ethereum } from "@graphprotocol/graph-ts"
import { Transfer as TransferEvent, BeefyVaultV7 as BeefyVaultV7Contract } from "../generated/templates/BeefyVaultV7/BeefyVaultV7"
import { getBeefyStrategy, getBeefyVault, isVaultInitialized } from "./entity/vault"
import { ZERO_BD, ZERO_BI, tokenAmountToDecimal } from "./utils/decimal"
import { getTokenAndInitIfNeeded } from "./entity/token"
import { SHARE_TOKEN_MINT_ADDRESS } from "./config"
import { getChainVaults, isBoostAddress } from "./vault-config"
import { getInvestor } from "./entity/investor"
import { getInvestorPosition } from "./entity/position"
import { ppfsToShareRate, rawShareBalanceToRawUnderlyingBalance } from "./utils/ppfs"
import { BeefyVault, Investor, Token } from "../generated/schema"
import { getVaultTokenBreakdown } from "./platform"
import { getInvestorPositionBalanceBreakdown, getVaultBalanceBreakdown, saveVaultBalanceBreakdownUpdateEvent } from "./entity/breakdown"
import { getClockTick } from "./entity/clock"
import { HOUR } from "./utils/time"
import { ADDRESS_ZERO } from "./utils/address"
import { TokenBalance } from "./platform/common"
import { Multicall3Params, multicall } from "./utils/multicall"

export function handleVaultTransfer(event: TransferEvent): void {
  // transfer to self
  if (event.params.from.equals(event.params.to)) {
    log.warning("handleVaultTransfer: transfer to self {}", [event.transaction.hash.toHexString()])
    return
  }

  /// value is zero
  if (event.params.value.equals(ZERO_BI)) {
    log.warning("handleVaultTransfer: zero value transfer {}", [event.transaction.hash.toHexString()])
    return
  }

  // ignore transfers from/to boosts
  if (isBoostAddress(event.params.from)) {
    log.warning("handleVaultTransfer: transfer from boost {}", [event.params.from.toHexString()])
    return
  }
  if (isBoostAddress(event.params.to)) {
    log.warning("handleVaultTransfer: transfer to boost {}", [event.params.to.toHexString()])
    return
  }

  let vault = getBeefyVault(event.address)
  if (!isVaultInitialized(vault)) {
    log.warning("handleVaultTransfer: vault is not initialized {}", [vault.id.toHexString()])
    return
  }

  updateVaultData(vault)

  if (!event.params.from.equals(SHARE_TOKEN_MINT_ADDRESS)) {
    const investorAddress = event.params.from
    const investor = getInvestor(investorAddress)
    investor.save()
    updateInvestorVaultData(vault, investor)
  }

  if (!event.params.to.equals(SHARE_TOKEN_MINT_ADDRESS)) {
    const investorAddress = event.params.to
    const investor = getInvestor(investorAddress)
    investor.save()
    updateInvestorVaultData(vault, investor)
  }

  updateVaultBreakDown(event.block, vault)
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
    log.debug("handleClockTick: tick already exists for 1h period", [])
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
  const vaultContract = BeefyVaultV7Contract.bind(Address.fromBytes(vault.id))
  const sharesToken = getTokenAndInitIfNeeded(vault.sharesToken)
  const underlyingToken = getTokenAndInitIfNeeded(vault.underlyingToken)

  // get the new investor deposit value
  const investorShareTokenBalanceRaw = vaultContract.balanceOf(Address.fromBytes(investor.id))
  const investorShareTokenBalance = tokenAmountToDecimal(investorShareTokenBalanceRaw, sharesToken.decimals)

  ///////
  // update investor positions
  const position = getInvestorPosition(vault, investor)
  position.rawSharesBalance = investorShareTokenBalanceRaw
  position.sharesBalance = investorShareTokenBalance
  // we assume the vault was updated before this function was called
  position.rawUnderlyingBalance = rawShareBalanceToRawUnderlyingBalance(vault.pricePerFullShare, investorShareTokenBalanceRaw, underlyingToken)
  position.underlyingBalance = position.sharesBalance.times(vault.shareToUnderlyingRate)
  position.save()

  return investor
}

function updateVaultData(vault: BeefyVault): BeefyVault {
  const underlyingToken = getTokenAndInitIfNeeded(vault.underlyingToken)
  const sharesToken = getTokenAndInitIfNeeded(vault.sharesToken)

  ///////
  // fetch data on chain
  const signatures = [
    new Multicall3Params(vault.id, "getPricePerFullShare()", "uint256"),
    new Multicall3Params(vault.id, "balance()", "uint256"),
    new Multicall3Params(vault.id, "totalSupply()", "uint256"),
  ]
  const results = multicall(signatures)

  const ppfs = results[0].value.toBigInt()
  const vaultBalancesRaw = results[1].value.toBigInt()
  const vaultSharesTotalSupplyRaw = results[2].value.toBigInt()

  ///////
  // compute derived values
  const vaultUnderlyingBalance = tokenAmountToDecimal(vaultBalancesRaw, underlyingToken.decimals)
  const vaultShareToUnderlyingRate = ppfsToShareRate(ppfs, underlyingToken)
  const vaultSharesTotalSupply = tokenAmountToDecimal(vaultSharesTotalSupplyRaw, sharesToken.decimals)

  ///////
  // update vault entities
  vault.rawSharesTokenTotalSupply = vaultSharesTotalSupplyRaw
  vault.sharesTokenTotalSupply = vaultSharesTotalSupply
  vault.pricePerFullShare = ppfs
  vault.shareToUnderlyingRate = vaultShareToUnderlyingRate
  vault.rawUnderlyingBalance = vaultBalancesRaw
  vault.underlyingBalance = vaultUnderlyingBalance
  vault.save()

  return vault
}

function updateVaultBreakDown(block: ethereum.Block, vault: BeefyVault): BeefyVault {
  // update breakdown of tokens in the vault
  const breakdown = getVaultTokenBreakdown(vault)
  const positions = vault.positions.load()
  saveVaultBalanceBreakdownUpdateEvent(vault, block)

  // also add the share token and underlying token to the breakdown
  // so we are also computing time weighted balance for those
  let foundSharesToken = false
  let foundUnderlyingToken = false
  for (let i = 0; i < breakdown.length; i++) {
    if (breakdown[i].tokenAddress.equals(vault.sharesToken)) {
      foundSharesToken = true
    }
    if (breakdown[i].tokenAddress.equals(vault.underlyingToken)) {
      foundUnderlyingToken = true
    }
  }
  if (!foundSharesToken) {
    breakdown.push(new TokenBalance(vault.sharesToken, vault.rawSharesTokenTotalSupply))
  }
  if (!foundUnderlyingToken) {
    breakdown.push(new TokenBalance(vault.underlyingToken, vault.rawUnderlyingBalance))
  }

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

    // also update the investor positions for that token
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
