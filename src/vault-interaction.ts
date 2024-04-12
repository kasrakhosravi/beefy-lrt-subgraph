import { Address, ethereum, log } from "@graphprotocol/graph-ts"
import {
  Deposit as DepositEvent,
  Withdraw as WithdrawEvent,
} from "../generated/templates/BeefyVaultV7/BeefyIStrategyV7"
import {
  Transfer as TransferEvent,
  BeefyVaultV7 as BeefyVaultV7Contract,
} from "../generated/templates/BeefyVaultV7/BeefyVaultV7"
import { getBeefyStrategy, getBeefyVault, isVaultRunning } from "./entity/vault"
import { ZERO_BI, tokenAmountToDecimal } from "./utils/decimal"
import { getToken } from "./entity/token"
import { SHARE_TOKEN_MINT_ADDRESS } from "./config"
import { isBoostAddress } from "./vault-config"
import { getInvestor } from "./entity/investor"
import { getInvestorPosition } from "./entity/position"
import { ppfsToShareRate } from "./utils/ppfs"

export function handleVaultDeposit(event: DepositEvent): void {
  updateUserPosition(event, event.transaction.from)
}
export function handleVaultWithdraw(event: WithdrawEvent): void {
  updateUserPosition(event, event.transaction.from)
}
export function handleVaultTransfer(event: TransferEvent): void {
  if (event.params.from.equals(event.params.to)) {
    log.info("handleVaultTransfer: from and to addresses are the same for vault {} at block {}", [
      event.address.toHexString(),
      event.block.number.toString(),
    ])
    return
  }

  if (event.params.value.equals(ZERO_BI)) {
    log.info("handleVaultTransfer: transfer value is zero for vault {} at block {}", [
      event.address.toHexString(),
      event.block.number.toString(),
    ])
    return
  }

  // don't duplicate processing between Transfer and Deposit/Withdraw
  if (event.params.from.equals(SHARE_TOKEN_MINT_ADDRESS) || event.params.to.equals(SHARE_TOKEN_MINT_ADDRESS)) {
    log.debug("handleVaultTransfer: skipping processing for vault {} at block {}", [
      event.address.toHexString(),
      event.block.number.toString(),
    ])
    return
  }

  // ignore transfers from/to boosts
  if (isBoostAddress(event.params.from)) {
    log.debug("handleVaultTransfer: skipping transfer processing for vault {} at block {}. Withdraw from boost {}", [
      event.address.toHexString(),
      event.block.number.toString(),
      event.params.from.toHexString(),
    ])
    return
  }
  if (isBoostAddress(event.params.to)) {
    log.debug("handleVaultTransfer: skipping transfer processing for vault {} at block {}. Deposit to boost {}", [
      event.address.toHexString(),
      event.block.number.toString(),
      event.params.to.toHexString(),
    ])
    return
  }

  log.info("handleVaultTransfer: processing transfer for vault {} at block {}", [
    event.address.toHexString(),
    event.block.number.toString(),
  ])
  updateUserPosition(event, event.params.to)
  updateUserPosition(event, event.params.from)
}

function updateUserPosition(event: ethereum.Event, investorAddress: Address): void {
  let vault = getBeefyVault(event.address)
  if (!isVaultRunning(vault)) {
    log.error("updateUserPosition: vault {} not active at block {}: {}", [
      vault.id.toHexString(),
      event.block.number.toString(),
      vault.lifecycle,
    ])
    return
  }

  const strategy = getBeefyStrategy(vault.strategy)
  const sharesToken = getToken(vault.sharesToken)
  const underlyingToken = getToken(vault.underlyingToken)

  let investor = getInvestor(investorAddress)
  investor.save()

  ///////
  // fetch data on chain
  // TODO: use multicall3 to fetch all data in one call
  log.debug("updateUserPosition: fetching data for vault {}", [vault.id.toHexString()])

  const vaultContract = BeefyVaultV7Contract.bind(Address.fromBytes(vault.id))
  const strategyAddress = Address.fromBytes(vault.strategy)

  // price per full share
  const ppfsRes = vaultContract.try_getPricePerFullShare()
  if (ppfsRes.reverted) {
    log.error("updateUserPosition: getPricePerFullShare() reverted for strategy {}", [vault.strategy.toHexString()])
    throw Error("updateUserPosition: getPricePerFullShare() reverted")
  }
  const ppfs = ppfsRes.value

  // underlying balance of the vault
  const vaultBalancesRes = vaultContract.try_balance()
  if (vaultBalancesRes.reverted) {
    log.error("handleStrategyHarvest: balance() reverted for strategy {}", [vault.strategy.toHexString()])
    throw Error("handleStrategyHarvest: balance() reverted")
  }
  const vaultUnderlyingBalance = tokenAmountToDecimal(vaultBalancesRes.value, underlyingToken.decimals)

  // get the new investor deposit value
  const investorBalanceRes = vaultContract.try_balanceOf(investorAddress)
  if (investorBalanceRes.reverted) {
    log.error("updateUserPosition: balanceOf() reverted for vault {}", [vault.id.toHexString()])
    throw Error("updateUserPosition: balanceOf() reverted")
  }
  const investorShareTokenBalanceRaw = investorBalanceRes.value
  const investorShareTokenBalance = tokenAmountToDecimal(investorShareTokenBalanceRaw, sharesToken.decimals)

  ///////
  // compute derived values
  log.debug("updateUserPosition: computing derived values for vault {}", [vault.id.toHexString()])
  const vaultShareToUnderlyingRate = ppfsToShareRate(ppfs, underlyingToken)
  const investorUnderlyingTokenBalance = investorShareTokenBalance.times(vaultShareToUnderlyingRate)

  ///////
  // update investor positions
  log.debug("updateUserPosition: updating investor position of investor {} for vault {}", [
    investor.id.toHexString(),
    vault.id.toHexString(),
  ])
  const position = getInvestorPosition(vault, investor)
  position.sharesBalance = investorShareTokenBalance
  position.underlyingBalance = investorUnderlyingTokenBalance
  position.save()

  ///////
  // update vault stats
  vault.pricePerFullShare = ppfs
  vault.shareToUnderlyingRate = vaultShareToUnderlyingRate
  vault.underlyingBalance = vaultUnderlyingBalance
  vault.save()
}
