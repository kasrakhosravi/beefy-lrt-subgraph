import { BeefyVault } from "../../generated/schema"
import { TokenBalance } from "./common"
import { Multicall3Params, multicall } from "../utils/multicall"

export function getVaultTokenBreakdownIchiLynex(vault: BeefyVault): Array<TokenBalance> {
  let balances = new Array<TokenBalance>()

  const ichiAlmAddress = vault.underlyingToken
  const signatures = [
    new Multicall3Params(vault.id, "balance()", "uint256"),
    new Multicall3Params(ichiAlmAddress, "totalSupply()", "uint256"),
    new Multicall3Params(ichiAlmAddress, "getBasePosition()", "(uint256,uint256,uint256)"),
    new Multicall3Params(ichiAlmAddress, "getLimitPosition()", "(uint256,uint256,uint256)"),
    new Multicall3Params(ichiAlmAddress, "token0()", "address"),
    new Multicall3Params(ichiAlmAddress, "token1()", "address"),
  ]

  const results = multicall(signatures)

  const wantTotalBalance = results[0].value.toBigInt()
  const totalSupply = results[1].value.toBigInt()
  const basePosition = results[2].value.toTuple()
  const limitPosition = results[3].value.toTuple()
  const token0 = results[4].value.toAddress()
  const token1 = results[5].value.toAddress()

  const basePositionAmount0 = basePosition[1].toBigInt()
  const basePositionAmount1 = basePosition[2].toBigInt()
  const limitPositionAmount0 = limitPosition[1].toBigInt()
  const limitPositionAmount1 = limitPosition[2].toBigInt()

  const wantBalance0 = basePositionAmount0.plus(limitPositionAmount0)
  const wantBalance1 = basePositionAmount1.plus(limitPositionAmount1)
  balances.push(new TokenBalance(token0, wantTotalBalance.div(totalSupply).times(wantBalance0)))
  balances.push(new TokenBalance(token1, wantTotalBalance.div(totalSupply).times(wantBalance1)))

  return balances
}
