import { Bytes } from "@graphprotocol/graph-ts"
import { BeefyStrategy, BeefyVault } from "../../generated/schema"
import { ADDRESS_ZERO } from "../utils/address"
import { ZERO_BD, ZERO_BI } from "../utils/decimal"

export const BEEFY_VAULT_LIFECYCLE_INITIALIZING = "INITIALIZING"
export const BEEFY_VAULT_LIFECYCLE_RUNNING = "RUNNING"
export const BEEFY_VAULT_LIFECYCLE_PAUSED = "PAUSED"

export function isVaultInitialized(vault: BeefyVault): boolean {
  return vault.lifecycle != BEEFY_VAULT_LIFECYCLE_INITIALIZING
}

export function isVaultRunning(vault: BeefyVault): boolean {
  return vault.lifecycle == BEEFY_VAULT_LIFECYCLE_RUNNING
}

export function isNewVault(vault: BeefyVault): boolean {
  return vault.sharesToken.equals(ADDRESS_ZERO)
}

export function getBeefyVault(vaultAddress: Bytes): BeefyVault {
  let vault = BeefyVault.load(vaultAddress)
  if (!vault) {
    vault = new BeefyVault(vaultAddress)
    vault.sharesToken = ADDRESS_ZERO
    vault.underlyingToken = ADDRESS_ZERO
    vault.strategy = ADDRESS_ZERO
    vault.isInitialized = false
    vault.initializedAtBlockNumber = ZERO_BI
    vault.initializedAtTimestamp = ZERO_BI
    vault.lifecycle = BEEFY_VAULT_LIFECYCLE_INITIALIZING
    vault.underlyingPlatform = ""
    vault.vaultId = ""
    vault.rawSharesTokenTotalSupply = ZERO_BI
    vault.sharesTokenTotalSupply = ZERO_BD
  }
  return vault
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
