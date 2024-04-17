import { Address, ethereum } from "@graphprotocol/graph-ts"
import { BeefyVaultV7 as BeefyVaultV7Contract } from "../generated/templates/BeefyVaultV7/BeefyVaultV7"
import { BEEFY_VAULT_LIFECYCLE_RUNNING, getBeefyStrategy, getBeefyVault } from "./entity/vault"
import { BeefyIStrategyV7 as BeefyIStrategyV7Template } from "../generated/templates"
import { ADDRESS_ZERO } from "./utils/address"
import { BeefyIStrategyV7 as BeefyIStrategyV7Contract } from "../generated/templates/BeefyIStrategyV7/BeefyIStrategyV7"
import { BeefyVault } from "../generated/schema"
import { getContextUnderlyingPlatform, getContextVaultKey } from "./vault-config"
import { getTokenAndInitIfNeeded } from "./entity/token"

export function handleVaultInitialized(event: ethereum.Event): void {
  const vaultAddress = event.address
  let vault = getBeefyVault(vaultAddress)
  // some chains don't have a proper initialized event so
  // we hook into another event that may trigger multiple times
  if (vault.isInitialized) {
    return
  }

  const vaultContract = BeefyVaultV7Contract.bind(vaultAddress)
  const strategyAddress = vaultContract.strategy()

  vault.isInitialized = true
  vault.strategy = strategyAddress
  vault.vaultId = getContextVaultKey()
  vault.underlyingPlatform = getContextUnderlyingPlatform()
  vault.initializedAtBlockNumber = event.block.number
  vault.initializedAtTimestamp = event.block.timestamp
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
    vault = fetchInitialVaultData(vault)
    vault.save()
  }
}

export function handleStrategyInitialized(event: ethereum.Event): void {
  const strategyAddress = event.address

  const strategyContract = BeefyIStrategyV7Contract.bind(strategyAddress)
  const vaultAddress = strategyContract.vault()

  const strategy = getBeefyStrategy(strategyAddress)
  strategy.isInitialized = true
  strategy.vault = vaultAddress
  strategy.save()

  let vault = getBeefyVault(vaultAddress)
  if (vault.isInitialized) {
    vault = fetchInitialVaultData(vault)
    vault.save()
  }
}

/**
 * Initialize the vault data.
 * Call this when both the vault and the strategy are initialized.
 */
function fetchInitialVaultData(vault: BeefyVault): BeefyVault {
  const vaultAddress = Address.fromBytes(vault.id)
  const vaultContract = BeefyVaultV7Contract.bind(vaultAddress)

  const want = vaultContract.want()
  const sharesToken = getTokenAndInitIfNeeded(vaultAddress)
  const underlyingToken = getTokenAndInitIfNeeded(want)

  vault.sharesToken = sharesToken.id
  vault.underlyingToken = underlyingToken.id
  vault.lifecycle = BEEFY_VAULT_LIFECYCLE_RUNNING

  return vault
}
