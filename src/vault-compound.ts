import { Address, log } from "@graphprotocol/graph-ts"
import { StratHarvest } from "../generated/templates/BeefyIStrategyV7/BeefyIStrategyV7"
import { getBeefyStrategy, getBeefyVault, isVaultRunning } from "./entity/vault"
import { getToken } from "./entity/token"
import { BeefyVaultV7 as BeefyVaultV7Contract } from "../generated/templates/BeefyVaultV7/BeefyVaultV7"
import { ZERO_BD, tokenAmountToDecimal } from "./utils/decimal"
import { ppfsToShareRate } from "./utils/ppfs"

export function handleStrategyHarvest(event: StratHarvest): void {
  let strategy = getBeefyStrategy(event.address)
  let vault = getBeefyVault(strategy.vault)
  if (!isVaultRunning(vault)) {
    log.error("handleHarvest: vault {} not active at block {}: {}", [
      vault.id.toHexString(),
      event.block.number.toString(),
      vault.lifecycle,
    ])
    return
  }

  log.debug("handleHarvest: processing harvest for vault {}", [vault.id.toHexString()])

  const sharesToken = getToken(vault.sharesToken)
  const underlyingToken = getToken(vault.underlyingToken)

  ///////
  // fetch data on chain
  // TODO: use multicall3 to fetch all data in one call
  log.debug("handleStrategyHarvest: fetching data for vault {}", [vault.id.toHexString()])
  const vaultContract = BeefyVaultV7Contract.bind(Address.fromBytes(vault.id))
  const strategyAddress = Address.fromBytes(vault.strategy)

  // price per full share
  const ppfsRes = vaultContract.try_getPricePerFullShare()
  if (ppfsRes.reverted) {
    log.error("updateUserPosition: getPricePerFullShare() reverted for strategy {}", [vault.strategy.toHexString()])
    throw Error("updateUserPosition: getPricePerFullShare() reverted")
  }
  const ppfs = ppfsRes.value

  // underlying balance of the vault
  const vaultBalancesRes = vaultContract.try_balance()
  if (vaultBalancesRes.reverted) {
    log.error("handleStrategyHarvest: balance() reverted for strategy {}", [vault.strategy.toHexString()])
    throw Error("handleStrategyHarvest: balance() reverted")
  }
  const vaultUnderlyingBalance = tokenAmountToDecimal(vaultBalancesRes.value, underlyingToken.decimals)

  ///////
  // compute derived values
  log.debug("updateUserPosition: computing derived values for vault {}", [vault.id.toHexString()])
  const vaultShareToUnderlyingRate = ppfsToShareRate(ppfs, underlyingToken)

  ///////
  // update vault entities
  vault.pricePerFullShare = ppfs
  vault.shareToUnderlyingRate = vaultShareToUnderlyingRate
  vault.underlyingBalance = vaultUnderlyingBalance
  vault.save()

  ///////
  // update investor positions
  log.debug("handleStrategyHarvest: updating investor positions for vault {}", [vault.id.toHexString()])
  let positions = vault.positions.load()
  let positivePositionCount = 0
  for (let i = 0; i < positions.length; i++) {
    let position = positions[i]
    if (!position.sharesBalance.gt(ZERO_BD)) {
      continue
    }
    positivePositionCount += 1

    log.debug("handleStrategyHarvest: updating investor position for investor {}", [position.investor.toHexString()])
    position.underlyingBalance = position.sharesBalance.times(vaultShareToUnderlyingRate)
    position.save()
  }
}
