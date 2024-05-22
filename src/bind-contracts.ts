import { BeefyVaultV7 as BeefyVaultV7Template } from "../generated/templates"
import { getChainVaults, buildVaultDataSourceContext } from "./vault-config"
import { ethereum, log } from "@graphprotocol/graph-ts"

export function bindAllContracts(_: ethereum.Event): void {
  const vaults = getChainVaults()

  // check for any duplicates to prevent misconfiguration
  const vaultAddresses = new Set<string>()
  for (let i = 0; i < vaults.length; i++) {
    const vaultAddress = vaults[i].address.toHexString()
    if (vaultAddresses.has(vaultAddress)) {
      log.error("getChainVaults: Duplicate vault address {}", [vaultAddress])
      throw new Error("Duplicate vault address")
    }
    vaultAddresses.add(vaultAddress)
  }

  for (let i = 0; i < vaults.length; i++) {
    const vault = vaults[i]
    // start indexing this vault
    const context = buildVaultDataSourceContext(vault)
    BeefyVaultV7Template.createWithContext(vault.address, context)
  }
}
