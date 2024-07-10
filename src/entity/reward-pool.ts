import { Bytes } from "@graphprotocol/graph-ts"
import { BeefyRewardPool, BeefyStrategy, BeefyVault } from "../../generated/schema"
import { ADDRESS_ZERO } from "../utils/address"

export function getBeefyRewardPool(rewardPoolAddress: Bytes): BeefyRewardPool {
  let rp = BeefyRewardPool.load(rewardPoolAddress)
  if (!rp) {
    rp = new BeefyRewardPool(rewardPoolAddress)
    rp.rcowToken = ADDRESS_ZERO
    rp.vault = ADDRESS_ZERO
  }
  return rp
}

export function getBeefyStrategy(strategyAddress: Bytes): BeefyStrategy {
  let strategy = BeefyStrategy.load(strategyAddress)
  if (!strategy) {
    strategy = new BeefyStrategy(strategyAddress)
    strategy.vault = ADDRESS_ZERO
    strategy.isInitialized = false
  }
  return strategy
}
