import { BeefyVault } from "../../generated/schema"
import { TokenBalance } from "./common"
import { Address } from "@graphprotocol/graph-ts"
import { getTokenAndInitIfNeeded } from "../entity/token"
import { SolidlyPool as SolidlyPoolContract } from "../../generated/templates/BeefyVaultV7/SolidlyPool"

export function getVaultTokenBreakdownSolidly(vault: BeefyVault): Array<TokenBalance> {
  let balances = new Array<TokenBalance>()

  const wantTotalBalance = vault.rawUnderlyingBalance
  const underlyingToken = getTokenAndInitIfNeeded(vault.underlyingToken)

  // fetch on chain data
  const poolContract = SolidlyPoolContract.bind(Address.fromBytes(underlyingToken.id))
  const meta = poolContract.metadata()
  const totalSupply = poolContract.totalSupply()

  balances.push(new TokenBalance(meta.getT0(), meta.getR0().times(wantTotalBalance).div(totalSupply)))
  balances.push(new TokenBalance(meta.getT1(), meta.getR1().times(wantTotalBalance).div(totalSupply)))

  return balances
}
