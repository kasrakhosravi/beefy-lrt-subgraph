import { BigDecimal, BigInt } from "@graphprotocol/graph-ts"
import { Token } from "../../generated/schema"
import { EIGHTEEN_BI, ONE_ETH_BD, ONE_ETH_BI } from "./decimal"

export function ppfsToShareRate(ppfs: BigInt, underlyingToken: Token): BigDecimal {
  // todo: account for underlying token decimals different than 18
  if (underlyingToken.decimals.notEqual(EIGHTEEN_BI)) {
    throw new Error("Not implemented yet")
  }
  return ppfs.toBigDecimal().div(ONE_ETH_BD)
}

export function rawShareBalanceToRawUnderlyingBalance(
  ppfs: BigInt,
  rawSharesBalance: BigInt,
  underlyingToken: Token,
): BigInt {
  // todo: account for underlying token decimals different than 18
  if (underlyingToken.decimals.notEqual(EIGHTEEN_BI)) {
    throw new Error("Not implemented yet")
  }
  return rawSharesBalance.times(ppfs).div(ONE_ETH_BI)
}
