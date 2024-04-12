import { log } from "@graphprotocol/graph-ts"
import { StratHarvest } from "../generated/templates/BeefyIStrategyV7/BeefyIStrategyV7"

export function handleStrategyHarvest(_: StratHarvest): void {
  log.info("handleStrategyHarvest", [])
}
