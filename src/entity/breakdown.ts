import { BalanceBreakdownItem, Token } from "../../generated/schema"
import { ZERO_BD, ZERO_BI } from "../utils/decimal"

export function getBreakdownItem(wrapperToken: Token, token: Token): BalanceBreakdownItem {
  let id = wrapperToken.id.concat(token.id)
  let breakdown = BalanceBreakdownItem.load(id)
  if (!breakdown) {
    breakdown = new BalanceBreakdownItem(id)
    breakdown.wrapperToken = wrapperToken.id
    breakdown.token = token.id
    breakdown.balance = ZERO_BD
    breakdown.lastUpdate = ZERO_BI
  }
  return breakdown
}
