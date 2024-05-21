import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { Token } from "../../generated/schema"
import { Multicall3Params, multicall } from "../utils/multicall"

export function getTokenAndInitIfNeeded(tokenAddress: Bytes): Token {
  let token = Token.load(tokenAddress)
  if (!token) {
    token = new Token(tokenAddress)

    const signatures = [
      new Multicall3Params(tokenAddress, "symbol()", "string"),
      new Multicall3Params(tokenAddress, "name()", "string"),
      new Multicall3Params(tokenAddress, "decimals()", "uint8"),
    ]

    const results = multicall(signatures)

    token.symbol = results[0].value.toString()
    token.name = results[1].value.toString()
    token.decimals = BigInt.fromI32(results[2].value.toI32())
    token.save()
  }
  return token
}
