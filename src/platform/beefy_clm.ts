import { BeefyVault } from "../../generated/schema"
import { TokenBalance } from "./common"
import { Multicall3Params, multicall } from "../utils/multicall"
import { ZERO_BI } from "../utils/decimal"

export function getVaultTokenBreakdownBeefyCLM(vault: BeefyVault): Array<TokenBalance> {
  let balances = new Array<TokenBalance>()

  const signatures = [
    new Multicall3Params(vault.id, "wants()", "(address,address)"),
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

export function getVaultTokenBreakdownBeefyCLMVault(vault: BeefyVault): Array<TokenBalance> {
  let balances = new Array<TokenBalance>()

  const clmAddress = vault.underlyingToken
  const signatures = [
    new Multicall3Params(vault.id, "balance()", "uint256"),
    new Multicall3Params(vault.id, "totalSupply()", "uint256"),
    new Multicall3Params(clmAddress, "wants()", "(address,address)"),
    new Multicall3Params(clmAddress, "balances()", "(uint256,uint256)"),
  ]

  const results = multicall(signatures)

  const vaultBalance = results[0].value.toBigInt()
  const vaultTotalSupply = results[1].value.toBigInt()
  const clmTokens = results[2].value.toTuple()
  const clmBalances = results[3].value.toTuple()

  for (let i = 0; i < clmTokens.length; i++) {
    const token = clmTokens[i].toAddress()
    const totalClmBalance = clmBalances[i].toBigInt()

    let balance = ZERO_BI
    if (vaultTotalSupply.gt(ZERO_BI)) {
      balance = totalClmBalance.times(vaultBalance).div(vaultTotalSupply)
    }

    balances.push(new TokenBalance(token, balance))
  }

  return balances
}
