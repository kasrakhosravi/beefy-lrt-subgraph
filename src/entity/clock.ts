import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { getIntervalFromTimestamp } from "../utils/time"
import { getSnapshotIdSuffix } from "../utils/snapshot"
import { ClockTick } from "../../generated/schema"

export function getClockTick(block: ethereum.Block, period: BigInt): ClockRes {
  let interval = getIntervalFromTimestamp(block.timestamp, period)
  let clockTickId = getSnapshotIdSuffix(period, interval)
  let clockTick = ClockTick.load(clockTickId)
  let isNew = false
  if (!clockTick) {
    isNew = true
    clockTick = new ClockTick(clockTickId)
    clockTick.timestamp = block.timestamp
    clockTick.blockNumber = block.number
    clockTick.roundedTimestamp = interval
    clockTick.period = period
  }
  return new ClockRes(clockTick, isNew)
}

class ClockRes {
  constructor(
    public tick: ClockTick,
    public isNew: boolean,
  ) {}
}
