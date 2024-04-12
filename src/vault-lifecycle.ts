import { Address, BigInt, dataSource } from "@graphprotocol/graph-ts"
import { BeefyVaultV7 as BeefyVaultV7Contract } from "../generated/templates/BeefyVaultV7/BeefyVaultV7"
import { BEEFY_VAULT_LIFECYCLE_RUNNING, getBeefyStrategy, getBeefyVault } from "./entity/vault"
import { Initialized as VaultInitialized } from "../generated/templates/BeefyVaultV7/BeefyVaultV7"
import { log } from "@graphprotocol/graph-ts"
import {
  BeefyVaultV7 as BeefyVaultV7Template,
  BeefyIStrategyV7 as BeefyIStrategyV7Template,
} from "../generated/templates"
import { ADDRESS_ZERO } from "./utils/address"
import {
  Initialized as StrategyInitializedEvent,
  BeefyIStrategyV7 as BeefyIStrategyV7Contract,
} from "../generated/templates/BeefyIStrategyV7/BeefyIStrategyV7"
import {} from "../generated/templates"
import { fetchAndSaveTokenData } from "./utils/token"
import { BeefyVault } from "../generated/schema"
import { CONTEXT_KEY_UNDERLYING_PLATFORM } from "./bind-contracts"

export function handleVaultInitialized(event: VaultInitialized): void {
  const vaultAddress = event.address
  const vaultContract = BeefyVaultV7Contract.bind(vaultAddress)

  const strategyAddressRes = vaultContract.try_strategy()
  if (strategyAddressRes.reverted) {
    log.error("handleVaultInitialized: strategy() reverted for vault {} on block {}", [
      vaultAddress.toHexString(),
      event.block.number.toString(),
    ])
    throw Error("handleVaultInitialized: strategy() reverted")
  }
  const strategyAddress = strategyAddressRes.value

  let context = dataSource.context()
  let underlyingPlatform = context.getString(CONTEXT_KEY_UNDERLYING_PLATFORM)

  let vault = getBeefyVault(vaultAddress)
  vault.isInitialized = true
  vault.strategy = strategyAddress
  vault.underlyingPlatform = underlyingPlatform
  vault.save() // needs to be saved before we can use it in the strategy events

  // we start watching strategy events
  BeefyIStrategyV7Template.create(strategyAddress)

  log.info("handleVaultInitialized: Vault {} initialized with strategy {} on block {}", [
    vault.id.toHexString(),
    vault.strategy.toHexString(),
    event.block.number.toString(),
  ])

  const strategy = getBeefyStrategy(strategyAddress)
  // the strategy may or may not be initialized
  // this is a test to know if that is the case
  const strategyContract = BeefyIStrategyV7Contract.bind(strategyAddress)
  const strategyVaultRes = strategyContract.try_vault()
  if (strategyVaultRes.reverted) {
    log.error("handleVaultInitialized: vault() reverted for strategy {} on block {}", [
      strategyAddress.toHexString(),
      event.block.number.toString(),
    ])
    throw Error("handleVaultInitialized: vault() reverted")
  }
  strategy.isInitialized = !strategyVaultRes.value.equals(ADDRESS_ZERO)

  if (strategy.isInitialized) {
    vault = fetchInitialVaultData(event.block.timestamp, vault)
    vault.save()
  }
}

export function handleStrategyInitialized(event: StrategyInitializedEvent): void {
  const strategyAddress = event.address

  const strategyContract = BeefyIStrategyV7Contract.bind(strategyAddress)
  const vaultAddressRes = strategyContract.try_vault()
  if (vaultAddressRes.reverted) {
    log.error("handleInitialized: vault() reverted for strategy {} on block {}", [
      strategyAddress.toHexString(),
      event.block.number.toString(),
    ])
    throw Error("handleInitialized: vault() reverted")
  }
  const vaultAddress = vaultAddressRes.value

  const strategy = getBeefyStrategy(strategyAddress)
  strategy.isInitialized = true
  strategy.vault = vaultAddress
  strategy.save()

  log.info("handleStrategyInitialized: Strategy {} initialized for vault {} on block {}", [
    strategy.id.toHexString(),
    strategy.vault.toHexString(),
    event.block.number.toString(),
  ])

  let vault = getBeefyVault(vaultAddress)
  if (vault.isInitialized) {
    vault = fetchInitialVaultData(event.block.timestamp, vault)
    vault.save()
  }
}

/**
 * Initialize the vault data.
 * Call this when both the vault and the strategy are initialized.
 */
function fetchInitialVaultData(timestamp: BigInt, vault: BeefyVault): BeefyVault {
  const vaultAddress = Address.fromBytes(vault.id)
  const vaultContract = BeefyVaultV7Contract.bind(vaultAddress)
  //const strategyAddress = Address.fromBytes(vault.strategy)
  //const strategyContract = BeefyIStrategyV7Contract.bind(strategyAddress)

  const wantRes = vaultContract.try_want()
  if (wantRes.reverted) {
    log.error("fetchInitialVaultData: want() reverted for vault {}.", [vaultAddress.toHexString()])
    throw Error("fetchInitialVaultData: want() reverted")
  }
  const want = wantRes.value

  const sharesToken = fetchAndSaveTokenData(vaultAddress)
  const underlyingToken = fetchAndSaveTokenData(want)

  vault.sharesToken = sharesToken.id
  vault.underlyingToken = underlyingToken.id
  vault.lifecycle = BEEFY_VAULT_LIFECYCLE_RUNNING

  log.info("fetchInitialVaultData: Vault {} now running with strategy {}.", [
    vault.id.toHexString(),
    vault.strategy.toHexString(),
  ])

  return vault
}
