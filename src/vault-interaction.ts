import { Address, ethereum, log } from "@graphprotocol/graph-ts"
import {
  Deposit as DepositEvent,
  Withdraw as WithdrawEvent,
} from "../generated/templates/BeefyVaultV7/BeefyIStrategyV7"
import { Transfer as TransferEvent } from "../generated/templates/BeefyVaultV7/BeefyVaultV7"
import { getBeefyStrategy, getBeefyVault, isVaultRunning } from "./entity/vault"
import { ZERO_BI } from "./utils/decimal"
import { getToken } from "./entity/token"
import { SHARE_TOKEN_MINT_ADDRESS } from "./config"

export function handleVaultDeposit(event: DepositEvent): void {
  updateUserPosition(event, event.transaction.from, true, false)
}
export function handleVaultWithdraw(event: WithdrawEvent): void {
  updateUserPosition(event, event.transaction.from, false, false)
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
  //   if (isBoostAddress(event.params.from)) {
  //     log.debug("handleVaultTransfer: skipping transfer processing for vault {} at block {}. Withdraw from boost {}", [
  //       event.address.toHexString(),
  //       event.block.number.toString(),
  //       event.params.from.toHexString(),
  //     ])
  //     return
  //   }
  //   if (isBoostAddress(event.params.to)) {
  //     log.debug("handleVaultTransfer: skipping transfer processing for vault {} at block {}. Deposit to boost {}", [
  //       event.address.toHexString(),
  //       event.block.number.toString(),
  //       event.params.to.toHexString(),
  //     ])
  //     return
  //   }

  log.info("handleVaultTransfer: processing transfer for vault {} at block {}", [
    event.address.toHexString(),
    event.block.number.toString(),
  ])
  updateUserPosition(event, event.params.to, true, true)
  updateUserPosition(event, event.params.from, false, true)
}

function updateUserPosition(
  event: ethereum.Event,
  investorAddress: Address,
  isDeposit: boolean,
  isTransfer: boolean,
): void {
  let vault = getBeefyVault(event.address)
  if (!isVaultRunning(vault)) {
    log.error("updateUserPosition: vault {} not active at block {}: {}", [
      vault.id.toHexString(),
      event.block.number.toString(),
      vault.lifecycle,
    ])
    return
  }

  log.debug("updateUserPosition: processing {} for vault {}", [
    isDeposit ? "deposit" : "withdraw",
    vault.id.toHexString(),
  ])

  const strategy = getBeefyStrategy(vault.strategy)
  const sharesToken = getToken(vault.sharesToken)
  const underlyingToken = getToken(vault.underlyingToken)
}
