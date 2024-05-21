import { BeefyVault } from "../../generated/schema"
import { TokenBalance } from "./common"

/**
 * @dev assumes no lend/borrow looping
 */
export function getVaultTokenBreakdownAave(vault: BeefyVault): Array<TokenBalance> {
  let balances = new Array<TokenBalance>()

  const wantTotalBalance = vault.rawUnderlyingBalance
  balances.push(new TokenBalance(vault.underlyingToken, wantTotalBalance))

  return balances
}
