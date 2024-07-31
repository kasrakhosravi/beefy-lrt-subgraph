import { VaultConfig, _getChainVaults } from "../src/vault-config"

const checkConfig = async () => {
  // fetch vault config from https://api.beefy.com/vaults

  type ApiVault = {
    id: string
    earnContractAddress: string
    earningPoints?: boolean
  }

  const apiVaults: ApiVault[] = await fetch("https://api.beefy.finance/vaults").then((res) => res.json())
  const configVaults = _getChainVaults("all")

  const configVaultsByAddress = configVaults.reduce(
    (acc, v) => {
      acc[v.address.toLocaleLowerCase()] = v
      return acc
    },
    {} as Record<string, VaultConfig>,
  )

  const configVaultById = configVaults.reduce(
    (acc, v) => {
      acc[v.vaultKey] = v
      return acc
    },
    {} as Record<string, VaultConfig>,
  )

  const apiVaultsEarningPoints = apiVaults.filter((v) => v.earningPoints)

  for (const apiVault of apiVaultsEarningPoints) {
    const configVaultFoundById = configVaultById[apiVault.id]
    const configVaultFoundByAddress = configVaultsByAddress[apiVault.earnContractAddress.toLocaleLowerCase()]

    if (!configVaultFoundByAddress) {
      console.log(`Vault ${apiVault.id} not found in config by address: ${apiVault.earnContractAddress}`)
    } else if (!configVaultFoundById) {
      console.log(
        `Vault with address ${apiVault.earnContractAddress} has incorrect id ${configVaultFoundByAddress.vaultKey} instead of ${apiVault.id}`,
      )
    } else {
      // OK
    }
  }
}

checkConfig()
