import { DataSourceContext } from "@graphprotocol/graph-ts"
import { BeefyVaultV7 as BeefyVaultV7Template } from "../generated/templates"
import { Initialized as InitializedEvent } from "../generated/templates/BeefyVaultV7/BeefyVaultV7"
import { getChainVaults } from "./vault-config"

export const CONTEXT_KEY_UNDERLYING_PLATFORM = "underlyingPlatform"

export function bindAllContracts(_: InitializedEvent): void {
  const vaults = getChainVaults()

  for (let i = 0; i < vaults.length; i++) {
    const vault = vaults[i]
    // start indexing this vault

    const context = new DataSourceContext()
    context.setString(CONTEXT_KEY_UNDERLYING_PLATFORM, vault.underlyingPlatform)
    BeefyVaultV7Template.createWithContext(vault.address, context)
  }
}
