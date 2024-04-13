import { Address, BigInt } from "@graphprotocol/graph-ts"
import { BeefyVaultV7 as BeefyVaultV7Contract } from "../generated/templates/BeefyVaultV7/BeefyVaultV7"
import { BEEFY_VAULT_LIFECYCLE_RUNNING, getBeefyStrategy, getBeefyVault } from "./entity/vault"
import { Initialized as VaultInitialized } from "../generated/templates/BeefyVaultV7/BeefyVaultV7"
import { BeefyIStrategyV7 as BeefyIStrategyV7Template } from "../generated/templates"
import { ADDRESS_ZERO } from "./utils/address"
import {
  Initialized as StrategyInitializedEvent,
  BeefyIStrategyV7 as BeefyIStrategyV7Contract,
} from "../generated/templates/BeefyIStrategyV7/BeefyIStrategyV7"
import {} from "../generated/templates"
import { fetchAndSaveTokenData } from "./utils/token"
import { BeefyVault } from "../generated/schema"
import { getContextUnderlyingPlatform } from "./vault-config"

export function handleVaultInitialized(event: VaultInitialized): void {
  const vaultAddress = event.address
  const vaultContract = BeefyVaultV7Contract.bind(vaultAddress)

  const strategyAddress = vaultContract.strategy()

  let vault = getBeefyVault(vaultAddress)
  vault.isInitialized = true
  vault.strategy = strategyAddress
  vault.underlyingPlatform = getContextUnderlyingPlatform()
  vault.save() // needs to be saved before we can use it in the strategy events

  // we start watching strategy events
  BeefyIStrategyV7Template.create(strategyAddress)

  const strategy = getBeefyStrategy(strategyAddress)
  // the strategy may or may not be initialized
  // this is a test to know if that is the case
  const strategyContract = BeefyIStrategyV7Contract.bind(strategyAddress)
  const strategyVault = strategyContract.vault()
  strategy.isInitialized = !strategyVault.equals(ADDRESS_ZERO)

  if (strategy.isInitialized) {
    vault = fetchInitialVaultData(event.block.timestamp, vault)
    vault.save()
  }
}

export function handleStrategyInitialized(event: StrategyInitializedEvent): void {
  const strategyAddress = event.address

  const strategyContract = BeefyIStrategyV7Contract.bind(strategyAddress)
  const vaultAddress = strategyContract.vault()

  const strategy = getBeefyStrategy(strategyAddress)
  strategy.isInitialized = true
  strategy.vault = vaultAddress
  strategy.save()

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

  const want = vaultContract.want()
  const sharesToken = fetchAndSaveTokenData(vaultAddress)
  const underlyingToken = fetchAndSaveTokenData(want)

  vault.sharesToken = sharesToken.id
  vault.underlyingToken = underlyingToken.id
  vault.lifecycle = BEEFY_VAULT_LIFECYCLE_RUNNING

  return vault
}
