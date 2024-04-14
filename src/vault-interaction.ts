import { Address, log, ethereum } from "@graphprotocol/graph-ts"
import {
  Transfer as TransferEvent,
  BeefyVaultV7 as BeefyVaultV7Contract,
} from "../generated/templates/BeefyVaultV7/BeefyVaultV7"
import { getBeefyStrategy, getBeefyVault, isVaultRunning } from "./entity/vault"
import { ZERO_BD, ZERO_BI, tokenAmountToDecimal } from "./utils/decimal"
import { getTokenAndInitIfNeeded } from "./entity/token"
import { SHARE_TOKEN_MINT_ADDRESS } from "./config"
import { getChainVaults, isBoostAddress } from "./vault-config"
import { getInvestor } from "./entity/investor"
import { getInvestorPosition } from "./entity/position"
import { ppfsToShareRate } from "./utils/ppfs"
import { BeefyVault, Investor } from "../generated/schema"
import { getVaultTokenBreakdown } from "./platform"
import {
  getInvestorPositionBalanceBreakdown,
  getVaultBalanceBreakdown,
  saveVaultBalanceBreakdownUpdateEvent,
} from "./entity/breakdown"
import { getClockTick } from "./entity/clock"
import { MINUTES_15 } from "./utils/time"
import { ADDRESS_ZERO } from "./utils/address"

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
  if (!isVaultRunning(vault)) {
    log.warning("handleVaultTransfer: vault is not running {}", [vault.id.toHexString()])
    return
  }

  if (!event.params.from.equals(SHARE_TOKEN_MINT_ADDRESS) || !event.params.to.equals(SHARE_TOKEN_MINT_ADDRESS)) {
    updateVaultData(vault)

    let investorAddress = ADDRESS_ZERO
    if (!event.params.from.equals(SHARE_TOKEN_MINT_ADDRESS)) {
      investorAddress = event.params.from
    } else if (!event.params.to.equals(SHARE_TOKEN_MINT_ADDRESS)) {
      investorAddress = event.params.to
    }

    let investor = getInvestor(investorAddress)
    investor.save()

    updateInvestorVaultData(vault, investor)
    updateVaultBreakDown(event.block, vault)
  }
}

export function handleStrategyHarvest(event: ethereum.Event): void {
  let strategy = getBeefyStrategy(event.address)
  let vault = getBeefyVault(strategy.vault)
  if (!isVaultRunning(vault)) {
    log.warning("handleStrategyHarvest: vault is not running {}", [vault.id.toHexString()])
    return
  }

  updateVaultData(vault)
  updateVaultBreakDown(event.block, vault)
}

export function handleClockTick(block: ethereum.Block): void {
  let tickRes15min = getClockTick(block.timestamp, MINUTES_15)
  if (!tickRes15min.isNew) {
    log.debug("handleClockTick: tick already exists for 15 minutes period", [])
    return
  }
  tickRes15min.tick.save()

  const vaultConfigs = getChainVaults()
  for (let i = 0; i < vaultConfigs.length; i++) {
    const vaultConfig = vaultConfigs[i]
    const vault = getBeefyVault(vaultConfig.address)
    if (!isVaultRunning(vault)) {
      log.debug("handleClockTick: vault is not running {}", [vault.id.toHexString()])
      continue
    }
    updateVaultData(vault) // we need the latest data before updating the breakdown
    updateVaultBreakDown(block, vault)
  }
}

function updateInvestorVaultData(vault: BeefyVault, investor: Investor): Investor {
  const vaultContract = BeefyVaultV7Contract.bind(Address.fromBytes(vault.id))
  const sharesToken = getTokenAndInitIfNeeded(vault.sharesToken)

  // get the new investor deposit value
  const investorShareTokenBalanceRaw = vaultContract.balanceOf(Address.fromBytes(investor.id))
  const investorShareTokenBalance = tokenAmountToDecimal(investorShareTokenBalanceRaw, sharesToken.decimals)

  ///////
  // update investor positions
  const position = getInvestorPosition(vault, investor)
  position.sharesBalance = investorShareTokenBalance
  position.save()

  return investor
}

function updateVaultData(vault: BeefyVault): BeefyVault {
  const underlyingToken = getTokenAndInitIfNeeded(vault.underlyingToken)
  const sharesToken = getTokenAndInitIfNeeded(vault.sharesToken)

  ///////
  // fetch data on chain
  // TODO: use multicall3 to fetch all data in one call
  const vaultContract = BeefyVaultV7Contract.bind(Address.fromBytes(vault.id))
  const ppfs = vaultContract.getPricePerFullShare()
  const vaultBalancesRaw = vaultContract.balance()
  const vaultSharesTotalSupplyRaw = vaultContract.totalSupply()
  const vaultUnderlyingBalance = tokenAmountToDecimal(vaultBalancesRaw, underlyingToken.decimals)

  ///////
  // compute derived values
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
    saveVaultBalanceBreakdownUpdateEvent(vault, block)

    // also update the investor positions for that token
    for (let j = 0; j < positions.length; j++) {
      const position = positions[j]
      let investorTokenBalance = ZERO_BD

      // vault is empty, set all positions to zero
      if (!vault.rawSharesTokenTotalSupply.equals(ZERO_BI)) {
        const investorPercentOfTotal = position.sharesBalance.div(vault.sharesTokenTotalSupply)
        investorTokenBalance = breakdownItem.balance.times(investorPercentOfTotal)
      }

      const positionBreakdownItem = getInvestorPositionBalanceBreakdown(position, token)
      positionBreakdownItem.balance = investorTokenBalance
      positionBreakdownItem.lastUpdateTimestamp = block.timestamp
      positionBreakdownItem.lastUpdateBlock = block.number
      positionBreakdownItem.save()
    }
  }

  return vault
}
