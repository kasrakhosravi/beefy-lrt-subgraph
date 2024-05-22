import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { Investor, InvestorTokenBalanceSnapshot, Token } from "../../generated/schema"
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

export function getInvestorBalanceSnapshot(investor: Investor, token: Token, timestamp: BigInt, period: BigInt): InvestorTokenBalanceSnapshot {
  const interval = getIntervalFromTimestamp(timestamp, period)
  const snapshotId = investor.id.concat(token.id).concat(getSnapshotIdSuffix(period, interval))
  let snapshot = InvestorTokenBalanceSnapshot.load(snapshotId)
  if (!snapshot) {
    snapshot = new InvestorTokenBalanceSnapshot(snapshotId)
    snapshot.investor = investor.id
    snapshot.token = token.id

    snapshot.period = period
    snapshot.timestamp = timestamp
    snapshot.roundedTimestamp = interval

    snapshot.rawBalance = ZERO_BI
    snapshot.balance = ZERO_BD
    snapshot.lastUpdateBlock = ZERO_BI
    snapshot.lastUpdateTimestamp = ZERO_BI

    // copy non-reseting values from the previous snapshot to the new snapshot
    const previousSnapshotId = investor.id.concat(token.id).concat(getPreviousSnapshotIdSuffix(period, interval))
    const previousSnapshot = InvestorTokenBalanceSnapshot.load(previousSnapshotId)
    if (previousSnapshot) {
      snapshot.rawBalance = previousSnapshot.rawBalance
      snapshot.balance = previousSnapshot.balance
      snapshot.lastUpdateBlock = previousSnapshot.lastUpdateBlock
      snapshot.lastUpdateTimestamp = previousSnapshot.lastUpdateTimestamp
    }
  }

  return snapshot
}
