import { BeefyVault } from "../../generated/schema"
import { TokenBalance } from "./common"
import { Address } from "@graphprotocol/graph-ts"
import { Multicall3Params, multicall } from "../utils/multicall"

export function getVaultTokenBreakdownSolidly(vault: BeefyVault): Array<TokenBalance> {
  let balances = new Array<TokenBalance>()

  const solidlyPoolAddress = Address.fromBytes(vault.underlyingToken)
  const signatures = [
    new Multicall3Params(vault.id, "balance()", "uint256"),
    new Multicall3Params(solidlyPoolAddress, "metadata()", "(uint256,uint256,uint256,uint256,bool,address,address)"),
    new Multicall3Params(solidlyPoolAddress, "totalSupply()", "uint256"),
  ]
  const results = multicall(signatures)
  const wantTotalBalance = results[0].value.toBigInt()
  const meta = results[1].value.toTuple()
  const totalSupply = results[2].value.toBigInt()

  const r0 = meta[2].toBigInt()
  const r1 = meta[3].toBigInt()
  const t0 = meta[5].toAddress()
  const t1 = meta[6].toAddress()

  balances.push(new TokenBalance(t0, r0.times(wantTotalBalance).div(totalSupply)))
  balances.push(new TokenBalance(t1, r1.times(wantTotalBalance).div(totalSupply)))

  return balances
}
