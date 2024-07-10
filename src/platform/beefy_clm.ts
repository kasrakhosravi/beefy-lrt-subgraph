import { BeefyVault } from "../../generated/schema"
import { TokenBalance } from "./common"
import { Multicall3Params, multicall } from "../utils/multicall"
import { Bytes } from "@graphprotocol/graph-ts"

export function getVaultTokenBreakdownBeefyCLM(vault: BeefyVault): Array<TokenBalance> {
  return _getCLMBreakdown(vault.id)
}

export function getVaultTokenBreakdownBeefyCLMRewardPool(vault: BeefyVault): Array<TokenBalance> {
  const signatures = [new Multicall3Params(vault.id, "stakedToken()", "address")]
  const results = multicall(signatures)
  const stakedToken = results[0].value.toAddress()
  return _getCLMBreakdown(stakedToken)
}

function _getCLMBreakdown(clmManagerAddress: Bytes): Array<TokenBalance> {
  let balances = new Array<TokenBalance>()

  const signatures = [
    new Multicall3Params(clmManagerAddress, "wants()", "(address,address)"),
    new Multicall3Params(clmManagerAddress, "balances()", "(uint256,uint256)"),
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
