import { Address, BigInt } from "@graphprotocol/graph-ts"

export class TokenBalance {
  constructor(
    public tokenAddress: Address,
    public rawBalance: BigInt,
  ) {}

  public toString(): string {
    return (
      "TokenBalance[tokenAddress: " +
      this.tokenAddress.toHexString() +
      ", rawBalance:" +
      this.rawBalance.toString() +
      "]"
    )
  }
}
