import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { Token } from "../../generated/schema"
import { IERC20 as IERC20Contract } from "../../generated/templates/BeefyVaultV7/IERC20"

export function getTokenAndInitIfNeeded(tokenAddress: Bytes): Token {
  let token = Token.load(tokenAddress)
  if (!token) {
    token = new Token(tokenAddress)
    const tokenContract = IERC20Contract.bind(Address.fromBytes(tokenAddress))
    token.symbol = tokenContract.symbol()
    token.name = tokenContract.name()
    token.decimals = BigInt.fromI32(tokenContract.decimals())
    token.save()
  }
  return token
}
