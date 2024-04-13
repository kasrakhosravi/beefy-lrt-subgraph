import { BeefyVaultV7 as BeefyVaultV7Template } from "../generated/templates"
import { getChainVaults, buildVaultDataSourceContext } from "./vault-config"
import { ethereum } from "@graphprotocol/graph-ts"

export function bindAllContracts(_: ethereum.Event): void {
  const vaults = getChainVaults()

  for (let i = 0; i < vaults.length; i++) {
    const vault = vaults[i]
    // start indexing this vault
    const context = buildVaultDataSourceContext(vault)
    BeefyVaultV7Template.createWithContext(vault.address, context)
  }
}
