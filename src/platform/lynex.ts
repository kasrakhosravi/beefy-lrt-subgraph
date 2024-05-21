import { BeefyVault } from "../../generated/schema"
import { TokenBalance } from "./common"
import { Multicall3Params, multicall } from "../utils/multicall"

export function getVaultTokenBreakdownLynex(vault: BeefyVault): Array<TokenBalance> {
  let balances = new Array<TokenBalance>()

  const lynexLpAddress = vault.underlyingToken
  const signatures = [
    new Multicall3Params(vault.id, "balance()", "uint256"),
    new Multicall3Params(lynexLpAddress, "totalSupply()", "uint256"),
    new Multicall3Params(lynexLpAddress, "reserve0()", "uint256"),
    new Multicall3Params(lynexLpAddress, "reserve1()", "uint256"),
    new Multicall3Params(lynexLpAddress, "token0()", "address"),
    new Multicall3Params(lynexLpAddress, "token1()", "address"),
  ]

  const results = multicall(signatures)

  const wantTotalBalance = results[0].value.toBigInt()
  const totalSupply = results[1].value.toBigInt()
  const wantBalance0 = results[2].value.toBigInt()
  const wantBalance1 = results[3].value.toBigInt()
  const token0 = results[4].value.toAddress()
  const token1 = results[5].value.toAddress()

  balances.push(new TokenBalance(token0, wantTotalBalance.div(totalSupply).times(wantBalance0)))
  balances.push(new TokenBalance(token1, wantTotalBalance.div(totalSupply).times(wantBalance1)))

  return balances
}
