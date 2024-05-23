import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { Investor, Token } from "../../generated/schema"
import { getIntervalFromTimestamp } from "../utils/time"
import { getPreviousSnapshotIdSuffix, getSnapshotIdSuffix } from "../utils/snapshot"
import { ZERO_BD, ZERO_BI } from "../utils/decimal"

export function getInvestor(accountAddress: Bytes): Investor {
  let investor = Investor.load(accountAddress)
  if (!investor) {
    investor = new Investor(accountAddress)
  }

  return investor
}
