import { BeefyVaultV7 as BeefyVaultV7Template, BeefyRewardPool as BeefyRewardPoolTemplate } from "../generated/templates"
import { getChainVaults, buildVaultDataSourceContext } from "./vault-config-asm"
import { ethereum, log } from "@graphprotocol/graph-ts"

export function bindAllContracts(_: ethereum.Event): void {
  const vaults = getChainVaults()

  // check for any duplicates to prevent misconfiguration
  const allVaultAddresses = new Set<string>()
  const allRewardPoolAddresses = new Set<string>()
  for (let i = 0; i < vaults.length; i++) {
    const vaultConfig = vaults[i]
    const vaultAddress = vaultConfig.address.toHexString()
    if (allVaultAddresses.has(vaultAddress)) {
      log.error("getChainVaults: Duplicate vault address {}", [vaultAddress])
      throw new Error("Duplicate vault address")
    }
    allVaultAddresses.add(vaultAddress)

    const vaultRpAddresses = vaultConfig.rewardPoolsAddresses
    for (let j = 0; vaultRpAddresses && j < vaultRpAddresses.length; j++) {
      const rpAddress = vaultRpAddresses[j].toHexString()
      if (allRewardPoolAddresses.has(rpAddress)) {
        log.error("getChainVaults: Duplicate reward pool address {}", [rpAddress])
        throw new Error("Duplicate reward pool address")
      }
      allRewardPoolAddresses.add(rpAddress)
    }
  }

  for (let i = 0; i < vaults.length; i++) {
    const vaultConfig = vaults[i]
    // start indexing this vault
    const context = buildVaultDataSourceContext(vaultConfig)
    BeefyVaultV7Template.createWithContext(vaultConfig.address, context)

    for (let j = 0; j < vaultConfig.rewardPoolsAddresses.length; j++) {
      const rpAddress = vaultConfig.rewardPoolsAddresses[j]
      BeefyRewardPoolTemplate.createWithContext(rpAddress, context)
    }
  }
}
