import { Address, BigInt, ethereum, log } from "@graphprotocol/graph-ts"
import { BeefyVaultV7 as BeefyVaultV7Contract, UpgradeStrat } from "../generated/templates/BeefyVaultV7/BeefyVaultV7"
import { BeefyRewardPool as BeefyRewardPoolContract } from "../generated/templates/BeefyVaultV7/BeefyRewardPool"
import { BEEFY_VAULT_LIFECYCLE_RUNNING, getBeefyStrategy, getBeefyVault } from "./entity/vault"
import { BeefyIStrategyV7 as BeefyIStrategyV7Template } from "../generated/templates"
import { ADDRESS_ZERO } from "./utils/address"
import { BeefyIStrategyV7 as BeefyIStrategyV7Contract } from "../generated/templates/BeefyIStrategyV7/BeefyIStrategyV7"
import { BeefyVault, Token } from "../generated/schema"
import { PLATFORM_BEEFY_CLM, getContextUnderlyingPlatform, getContextVaultKey } from "./vault-config"
import { getToken, getTokenAndInitIfNeeded } from "./entity/token"
import { getBeefyRewardPool } from "./entity/reward-pool"

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

export function handleRewardPoolInitialized(event: ethereum.Event): void {
  const rpAddress = event.address

  const rp = getBeefyRewardPool(rpAddress)

  const rpContract = BeefyRewardPoolContract.bind(rpAddress)

  const stakedTokenAddress = rpContract.stakedToken()
  const stakedVault = BeefyVault.load(stakedTokenAddress)
  if (stakedVault == null) {
    log.error("handleRewardPoolInitialized: stakedTokenAddress is not a vault: {}. Ignoring", [stakedTokenAddress.toHexString()])
    return
  }

  const rcowToken = getTokenAndInitIfNeeded(rpAddress)

  rp.vault = stakedVault.id
  rp.rcowToken = rcowToken.id
  rp.save()
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

  const sharesToken = getTokenAndInitIfNeeded(vaultAddress)

  // for CLM, vault.want is not an ERC20 token
  const want = vaultContract.want()
  let underlyingToken: Token | null = null
  if (vault.underlyingPlatform == PLATFORM_BEEFY_CLM) {
    const mockToken = getToken(want)
    mockToken.name = "CLMMockUnderlying " + vault.vaultId
    mockToken.symbol = "CLMMockUnderlying-" + vault.vaultId
    mockToken.decimals = BigInt.fromI32(18)
    mockToken.save()
    underlyingToken = mockToken
  } else {
    underlyingToken = getTokenAndInitIfNeeded(want)
  }

  vault.sharesToken = sharesToken.id
  vault.underlyingToken = underlyingToken.id
  vault.lifecycle = BEEFY_VAULT_LIFECYCLE_RUNNING

  return vault
}

export function handleUpgradeStrat(event: UpgradeStrat): void {
  const vault = getBeefyVault(event.address)
  const newStrategyAddress = event.params.implementation
  const oldStrategyAddress = vault.strategy
  vault.strategy = newStrategyAddress
  vault.save()

  // we start watching the new strategy events
  BeefyIStrategyV7Template.create(newStrategyAddress)

  // create the new strategy entity
  const newStrategy = getBeefyStrategy(newStrategyAddress)
  newStrategy.isInitialized = true
  newStrategy.vault = vault.id
  newStrategy.save()

  // make sure we deprecated the old strategy
  // so events are ignored
  const oldStrategy = getBeefyStrategy(oldStrategyAddress)
  oldStrategy.isInitialized = false
  oldStrategy.vault = ADDRESS_ZERO
  oldStrategy.save()
}
