import { BeefyVault } from "../../generated/schema"
import { TokenBalance } from "./common"
import { Address } from "@graphprotocol/graph-ts"
import { Multicall3Params, multicall } from "../utils/multicall"

export function getVaultTokenBreakdownGamma(vault: BeefyVault): Array<TokenBalance> {
  let balances = new Array<TokenBalance>()

  // fetch on chain data
  const gammaHypervisorAddress = Address.fromBytes(vault.underlyingToken)
  const signatures = [
    new Multicall3Params(vault.id, "balance()", "uint256"),
    new Multicall3Params(gammaHypervisorAddress, "totalSupply()", "uint256"),
    new Multicall3Params(gammaHypervisorAddress, "getTotalAmounts()", "(uint256,uint256)"),
    new Multicall3Params(gammaHypervisorAddress, "token0()", "address"),
    new Multicall3Params(gammaHypervisorAddress, "token1()", "address"),
  ]

  const results = multicall(signatures)

  const wantTotalBalance = results[0].value.toBigInt()
  const totalSupply = results[1].value.toBigInt()
  const totalAmounts = results[2].value.toTuple()
  const token0 = results[3].value.toAddress()
  const token1 = results[4].value.toAddress()

  const totalAmount0 = totalAmounts[0].toBigInt()
  const totalAmount1 = totalAmounts[1].toBigInt()

  balances.push(new TokenBalance(token0, totalAmount0.times(wantTotalBalance).div(totalSupply)))
  balances.push(new TokenBalance(token1, totalAmount1.times(wantTotalBalance).div(totalSupply)))

  return balances
}
