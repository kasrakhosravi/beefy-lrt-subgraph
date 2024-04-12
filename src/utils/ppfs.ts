import { BigDecimal, BigInt } from "@graphprotocol/graph-ts"
import { Token } from "../../generated/schema"
import { ONE_ETH_BD } from "./decimal"

export function ppfsToShareRate(ppfs: BigInt, underlyingToken: Token): BigDecimal {
  // todo: account for underlying token decimals
  return ppfs.toBigDecimal().div(ONE_ETH_BD)
}
