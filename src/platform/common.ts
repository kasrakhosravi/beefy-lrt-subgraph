import { Address } from "@graphprotocol/graph-ts"

export class TokenBalance {
  constructor(
    public tokenAddress: Address,
    public rawBalance: BigInt,
  ) {}
}
