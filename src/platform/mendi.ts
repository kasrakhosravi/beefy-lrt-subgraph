import { BeefyVault } from "../../generated/schema"
import { TokenBalance } from "./common"

export function getVaultTokenBreakdownMendiLending(vault: BeefyVault): Array<TokenBalance> {
  let balances = new Array<TokenBalance>()

  const wantTotalBalance = vault.rawUnderlyingBalance
  balances.push(new TokenBalance(vault.underlyingToken, wantTotalBalance))

  return balances
}
