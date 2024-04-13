import { VaultBalanceBreakdownItem, BeefyVault, Token } from "../../generated/schema"
import { ZERO_BD, ZERO_BI } from "../utils/decimal"

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
