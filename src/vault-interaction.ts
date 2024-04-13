import { Address, ethereum, log } from "@graphprotocol/graph-ts"
import {
  Deposit as DepositEvent,
  StratHarvest,
  Withdraw as WithdrawEvent,
} from "../generated/templates/BeefyVaultV7/BeefyIStrategyV7"
import {
  Transfer as TransferEvent,
  BeefyVaultV7 as BeefyVaultV7Contract,
} from "../generated/templates/BeefyVaultV7/BeefyVaultV7"
import { getBeefyStrategy, getBeefyVault, isVaultRunning } from "./entity/vault"
import { ZERO_BI, tokenAmountToDecimal } from "./utils/decimal"
import { getTokenAndInitIfNeeded } from "./entity/token"
import { SHARE_TOKEN_MINT_ADDRESS } from "./config"
import { isBoostAddress } from "./vault-config"
import { getInvestor } from "./entity/investor"
import { getInvestorPosition } from "./entity/position"
import { ppfsToShareRate } from "./utils/ppfs"
import { BeefyVault, Investor } from "../generated/schema"
import { getVaultTokenBreakdown } from "./platform"
import { getBreakdownItem } from "./entity/breakdown"

export function handleVaultDeposit(event: DepositEvent): void {
  updateUserPosition(event, event.transaction.from)
}
export function handleVaultWithdraw(event: WithdrawEvent): void {
  updateUserPosition(event, event.transaction.from)
}
export function handleVaultTransfer(event: TransferEvent): void {
  // transfer to self
  if (event.params.from.equals(event.params.to)) {
    return
  }

  /// value is zero
  if (event.params.value.equals(ZERO_BI)) {
    return
  }

  // don't duplicate processing between Transfer and Deposit/Withdraw
  if (event.params.from.equals(SHARE_TOKEN_MINT_ADDRESS) || event.params.to.equals(SHARE_TOKEN_MINT_ADDRESS)) {
    return
  }

  // ignore transfers from/to boosts
  if (isBoostAddress(event.params.from)) {
    return
  }
  if (isBoostAddress(event.params.to)) {
    return
  }

  // update both users
  updateUserPosition(event, event.params.to)
  updateUserPosition(event, event.params.from)
}

export function handleStrategyHarvest(event: StratHarvest): void {
  let strategy = getBeefyStrategy(event.address)
  let vault = getBeefyVault(strategy.vault)
  if (!isVaultRunning(vault)) {
    return
  }

  updateVaultData(event, vault)
}

function updateUserPosition(event: ethereum.Event, investorAddress: Address): void {
  let vault = getBeefyVault(event.address)
  if (!isVaultRunning(vault)) {
    return
  }

  updateVaultData(event, vault)

  let investor = getInvestor(investorAddress)
  investor.save()
  updateInvestorVaultData(vault, investor)
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

function updateVaultData(event: ethereum.Event, vault: BeefyVault): BeefyVault {
  const underlyingToken = getTokenAndInitIfNeeded(vault.underlyingToken)

  ///////
  // fetch data on chain
  // TODO: use multicall3 to fetch all data in one call
  const vaultContract = BeefyVaultV7Contract.bind(Address.fromBytes(vault.id))
  const ppfs = vaultContract.getPricePerFullShare()
  const vaultBalancesRaw = vaultContract.balance()
  const vaultUnderlyingBalance = tokenAmountToDecimal(vaultBalancesRaw, underlyingToken.decimals)

  ///////
  // compute derived values
  const vaultShareToUnderlyingRate = ppfsToShareRate(ppfs, underlyingToken)

  ///////
  // update vault entities
  vault.pricePerFullShare = ppfs
  vault.shareToUnderlyingRate = vaultShareToUnderlyingRate
  vault.rawUnderlyingBalance = vaultBalancesRaw
  vault.underlyingBalance = vaultUnderlyingBalance
  vault.save()

  // update breakdown of tokens in the vault
  const breakdown = getVaultTokenBreakdown(vault)
  for (let i = 0; i < breakdown.length; i++) {
    const tokenBalance = breakdown[i]
    const token = getTokenAndInitIfNeeded(tokenBalance.tokenAddress)

    // now the balance breakdown
    const breakdownItem = getBreakdownItem(underlyingToken, token)
    breakdownItem.rawBalance = tokenBalance.rawBalance
    breakdownItem.balance = tokenAmountToDecimal(tokenBalance.rawBalance, token.decimals)
    breakdownItem.lastUpdate = event.block.timestamp
    breakdownItem.save()
  }
  return vault
}
