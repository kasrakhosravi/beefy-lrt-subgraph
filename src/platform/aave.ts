import { BeefyVault } from "../../generated/schema"
import { TokenBalance } from "./common"
import { getTokenAndInitIfNeeded } from "../entity/token"
import { Address } from "@graphprotocol/graph-ts"

/**
 * @dev assumes no lend/borrow looping
 */
export function getVaultTokenBreakdownAave(vault: BeefyVault): Array<TokenBalance> {
  let balances = new Array<TokenBalance>()

  const wantTotalBalance = vault.rawUnderlyingBalance
  const underlyingToken = getTokenAndInitIfNeeded(vault.underlyingToken)

  balances.push(new TokenBalance(Address.fromBytes(underlyingToken.id), wantTotalBalance))

  return balances
}
