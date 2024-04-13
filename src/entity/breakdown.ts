import { VaultBalanceBreakdownItem, BeefyVault, Token, VaultBalanceBreakdownUpdateEvent } from "../../generated/schema"
import { ZERO_BD, ZERO_BI } from "../utils/decimal"
import { Bytes, ethereum } from "@graphprotocol/graph-ts"

export function getBreakdownItem(vault: BeefyVault, token: Token): VaultBalanceBreakdownItem {
  let id = vault.id.concat(token.id)
  let breakdown = VaultBalanceBreakdownItem.load(id)
  if (!breakdown) {
    breakdown = new VaultBalanceBreakdownItem(id)
    breakdown.vault = vault.id
    breakdown.token = token.id
    breakdown.balance = ZERO_BD
    breakdown.lastUpdateTimestamp = ZERO_BI
    breakdown.lastUpdateBlock = ZERO_BI
  }
  return breakdown
}

export function saveUpdateEvent(vault: BeefyVault, block: ethereum.Block): void {
  const id = vault.id.concat(Bytes.fromByteArray(Bytes.fromBigInt(block.number)))
  let event = VaultBalanceBreakdownUpdateEvent.load(id)
  if (!event) {
    let event = new VaultBalanceBreakdownUpdateEvent(id)
    event.vault = vault.id
    event.blockNumber = block.number
    event.blockTimestamp = block.timestamp
    event.save()
  }
}
