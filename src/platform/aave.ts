import { BeefyVault } from "../../generated/schema"
import { TokenBalance } from "./common"
import { BeefyVaultV7 as BeefyVaultV7Contract } from "../../generated/templates/BeefyVaultV7/BeefyVaultV7"
import { Address } from "@graphprotocol/graph-ts"

/**
 * @dev assumes no lend/borrow looping
 */
export function getVaultTokenBreakdownAave(vault: BeefyVault): Array<TokenBalance> {
  let balances = new Array<TokenBalance>()

  const vaultContract = BeefyVaultV7Contract.bind(Address.fromBytes(vault.sharesToken))
  const wantTotalBalance = vaultContract.balance()

  balances.push(new TokenBalance(vault.underlyingToken, wantTotalBalance))

  return balances
}
