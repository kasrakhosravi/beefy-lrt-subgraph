import { BeefyVault } from "../../generated/schema"
import { TokenBalance } from "./common"
import { Address } from "@graphprotocol/graph-ts"
import { getTokenAndInitIfNeeded } from "../entity/token"
import { GammaHypervisor as GammaHypervisorContract } from "../../generated/templates/BeefyVaultV7/GammaHypervisor"

export function getVaultTokenBreakdownGamma(vault: BeefyVault): Array<TokenBalance> {
  let balances = new Array<TokenBalance>()

  const wantTotalBalance = vault.rawUnderlyingBalance
  const underlyingToken = getTokenAndInitIfNeeded(vault.underlyingToken)

  // fetch on chain data
  const gammaHypervisorContract = GammaHypervisorContract.bind(Address.fromBytes(underlyingToken.id))
  const totalSupply = gammaHypervisorContract.totalSupply()
  const totalAmounts = gammaHypervisorContract.getTotalAmounts()
  const token0 = gammaHypervisorContract.token0()
  const token1 = gammaHypervisorContract.token1()

  balances.push(new TokenBalance(token0, totalAmounts.getTotal0().times(wantTotalBalance).div(totalSupply)))
  balances.push(new TokenBalance(token1, totalAmounts.getTotal1().times(wantTotalBalance).div(totalSupply)))

  return balances
}
