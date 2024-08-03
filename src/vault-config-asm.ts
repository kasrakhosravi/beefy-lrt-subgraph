import { Address, DataSourceContext, log, dataSource, Bytes } from "@graphprotocol/graph-ts"
import { NETWORK_NAME } from "./config"
import { VaultConfig, _getChainVaults } from "./vault-config"
import { RANDOM } from "./random"

export const PLATFORM_AAVE = "AAVE"
export const PLATFORM_BALANCER_AURA = "BALANCER_AURA"
export const PLATFORM_CURVE = "CURVE"
export const PLATFORM_GAMMA = "GAMMA"
export const PLATFORM_ICHI_LYNEX = "ICHI_LYNEX"
export const PLATFORM_LYNEX = "LYNEX"
export const PLATFORM_MENDI_LENDING = "MENDI_LENDING"
export const PLATFORM_MENDI_LEVERAGE = "MENDI_LEVERAGE"
export const PLATFORM_NILE = "NILE"
export const PLATFORM_PENDLE_EQUILIBRIA = "PENDLE_EQUILIBRIA"
export const PLATFORM_SOLIDLY = "SOLIDLY"
export const PLATFORM_BEEFY_CLM = "BEEFY_CLM"
export const TRACK_ONLY_SHARE_TOKEN_BALANCE = "TRACK_ONLY_SHARE_TOKEN_BALANCE"
export const TRACK_ONLY_SHARE_AND_UNDERLYING_TOKEN_BALANCE = "TRACK_ONLY_SHARE_AND_UNDERLYING_TOKEN_BALANCE"

export function getChainVaults(): Array<VaultConfigAsm> {
  const network = NETWORK_NAME as string
  log.debug("getChainVaults: network={} rng={}", [network, RANDOM])

  const configs = _getChainVaults(network)

  const vaults = new Array<VaultConfigAsm>()
  for (let i = 0; i < configs.length; i++) {
    vaults.push(new VaultConfigAsm(configs[i]))
  }

  return vaults
}

export function getVaultConfigByAddress(address: Bytes): VaultConfigAsm | null {
  const vaults = getChainVaults()
  for (let i = 0; i < vaults.length; i++) {
    if (vaults[i].address.equals(address)) {
      return vaults[i]
    }
  }

  return null
}

export function isBoostAddress(address: Address): boolean {
  const vaults = getChainVaults()
  for (let i = 0; i < vaults.length; i++) {
    for (let j = 0; j < vaults[i].boostAddresses.length; j++) {
      if (vaults[i].boostAddresses[j].equals(address)) {
        return true
      }
    }
  }

  return false
}
export function isRewardPoolAddress(address: Address): boolean {
  const vaults = getChainVaults()
  for (let i = 0; i < vaults.length; i++) {
    for (let j = 0; j < vaults[i].rewardPoolsAddresses.length; j++) {
      if (vaults[i].rewardPoolsAddresses[j].equals(address)) {
        return true
      }
    }
  }

  return false
}

const CONTEXT_KEY_UNDERLYING_PLATFORM = "underlyingPlatform"
const CONTEXT_KEY_VAULT_KEY = "vaultKey"

export function buildVaultDataSourceContext(vault: VaultConfigAsm): DataSourceContext {
  let context = new DataSourceContext()
  context.setString(CONTEXT_KEY_UNDERLYING_PLATFORM, vault.underlyingPlatform)
  context.setString(CONTEXT_KEY_VAULT_KEY, vault.vaultKey)
  return context
}

export function getContextUnderlyingPlatform(): string {
  let context = dataSource.context()
  return context.getString(CONTEXT_KEY_UNDERLYING_PLATFORM)
}

export function getContextVaultKey(): string {
  let context = dataSource.context()
  return context.getString(CONTEXT_KEY_VAULT_KEY)
}

class VaultConfigAsm {
  public vaultKey: string
  public underlyingPlatform: string
  public address: Address
  public boostAddresses: Array<Address>
  public rewardPoolsAddresses: Array<Address>

  constructor(config: VaultConfig) {
    this.vaultKey = config.vaultKey
    this.underlyingPlatform = config.underlyingPlatform
    this.address = Address.fromString(config.address)
    this.boostAddresses = new Array<Address>()
    this.rewardPoolsAddresses = new Array<Address>()

    for (let i = 0; i < config.rewardPoolsAddresses.length; i++) {
      this.rewardPoolsAddresses.push(Address.fromString(config.rewardPoolsAddresses[i]))
    }
    for (let i = 0; i < config.boostAddresses.length; i++) {
      this.boostAddresses.push(Address.fromString(config.boostAddresses[i]))
    }
  }
}
