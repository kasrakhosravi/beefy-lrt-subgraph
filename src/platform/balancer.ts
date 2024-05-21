import { BeefyVault } from "../../generated/schema"
import { TokenBalance } from "./common"
import { BalancerPool as BalancerPoolContract } from "../../generated/templates/BeefyVaultV7/BalancerPool"
import { BalancerVault as BalancerVaultContract } from "../../generated/templates/BeefyVaultV7/BalancerVault"
import { Address } from "@graphprotocol/graph-ts"

export function getVaultTokenBreakdownBalancer(vault: BeefyVault): Array<TokenBalance> {
  let balances = new Array<TokenBalance>()

  const wantTotalBalance = vault.rawUnderlyingBalance

  // fetch on chain data
  const balancerPoolContract = BalancerPoolContract.bind(Address.fromBytes(vault.underlyingToken))
  const balancerVaultAddress = balancerPoolContract.getVault()
  const balancerPoolId = balancerPoolContract.getPoolId()
  const balancerTotalSupply = balancerPoolContract.getActualSupply()
  const balancerVaultContract = BalancerVaultContract.bind(balancerVaultAddress)
  const poolTokensRes = balancerVaultContract.getPoolTokens(balancerPoolId)
  const poolTokens = poolTokensRes.getTokens()
  const poolBalances = poolTokensRes.getBalances()

  // compute breakdown
  for (let i = 0; i < poolTokens.length; i++) {
    const poolToken = poolTokens[i]
    const poolBalance = poolBalances[i]
    balances.push(new TokenBalance(poolToken, poolBalance.times(wantTotalBalance).div(balancerTotalSupply)))
  }

  return balances
}
