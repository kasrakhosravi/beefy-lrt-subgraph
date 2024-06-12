import { BeefyVault } from "../../generated/schema"
import { TokenBalance } from "./common"
import { Multicall3Params, multicall } from "../utils/multicall"

export function getVaultTokenBreakdownBeefyCLM(vault: BeefyVault): Array<TokenBalance> {
  let balances = new Array<TokenBalance>()

  const signatures = [
    new Multicall3Params(vault.id, "wants()", "(uint256,uint256)"),
    new Multicall3Params(vault.id, "balances()", "(uint256,uint256)"),
  ]

  const results = multicall(signatures)

  const wants = results[0].value.toTuple()
  const wantBalances = results[1].value.toTuple()

  for (let i = 0; i < wants.length; i++) {
    const want = wants[i].toAddress()
    const balance = wantBalances[i].toBigInt()
    balances.push(new TokenBalance(want, balance))
  }

  return balances
}
