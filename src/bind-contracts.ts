import { BeefyVaultV7 as BeefyVaultV7Template } from "../generated/templates"
import { Initialized as InitializedEvent } from "../generated/templates/BeefyVaultV7/BeefyVaultV7"
import { getChainVaults, buildVaultDataSourceContext } from "./vault-config"

export function bindAllContracts(_: InitializedEvent): void {
  const vaults = getChainVaults()

  for (let i = 0; i < vaults.length; i++) {
    const vault = vaults[i]
    // start indexing this vault
    const context = buildVaultDataSourceContext(vault)
    BeefyVaultV7Template.createWithContext(vault.address, context)
  }
}
