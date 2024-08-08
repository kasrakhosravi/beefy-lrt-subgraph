import { VaultConfig, _getChainVaults } from "../src/vault-config"
import * as fs from "fs"

const checkConfig = async ({ chain }: { chain: string }) => {
  console.log(`\n================================================`)
  console.log(`\n======================== ${chain} ========================`)
  // fetch vault config from https://api.beefy.com/vaults

  type ApiVault = {
    id: string
    assets: string[]
    earnContractAddress: string
    earningPoints?: boolean
  }

  const classicVaults: ApiVault[] = await fetch(`https://api.beefy.finance/vaults/${chain}`).then((res) => res.json())
  const cowVaults: ApiVault[] = await fetch(`https://api.beefy.finance/cow-vaults/${chain}`).then((res) => res.json())
  const apiVaults = classicVaults.concat(cowVaults)
  const configVaults = _getChainVaults(chain)

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

  // === Check for missing vaults ===
  console.log("\n========= Checking for missing vaults")
  const apiVaultsEarningPoints = apiVaults.filter((v) => v.earningPoints)

  for (const apiVault of apiVaultsEarningPoints) {
    const configVaultFoundById = configVaultById[apiVault.id]
    const configVaultFoundByAddress = configVaultsByAddress[apiVault.earnContractAddress.toLocaleLowerCase()]

    const foundInConfig = configVaultFoundById || configVaultFoundByAddress
    if (!foundInConfig) {
      console.error(
        `ERROR: Vault ${apiVault.id} not found in LRT subgraph config by id: ${apiVault.id} or by address: ${apiVault.earnContractAddress}`,
      )
    }

    if (foundInConfig) {
      if (!configVaultFoundByAddress) {
        console.warn(
          `WARN: Vault with id ${apiVault.id} has incorrect address ${configVaultFoundById.address} instead of ${apiVault.earnContractAddress}`,
        )
      }
    }
  }

  // === Check for duplicates ===
  console.log("\n========= Checking for duplicates")

  const duplicateConfigByAddress = configVaults.reduce(
    (acc, v) => {
      acc[v.address.toLocaleLowerCase()] = (acc[v.address.toLocaleLowerCase()] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )
  for (const [address, count] of Object.entries(duplicateConfigByAddress)) {
    if (count > 1) {
      console.error(`Duplicate config for address ${address}`)
      throw new Error(`Duplicate config for address ${address}`)
    }
  }

  // === Check for token coverage ===

  console.log("\n========= Checking token coverage")

  // https://github.com/beefyfinance/beefy-lrt-api/blob/main/src/config/chains.ts#L16
  const anzen = ["USDz", "sUSDz"]
  const bedrock = ["uniETH"]
  const dolomite = ["dUSDC"]
  const ethena = ["USDe"]
  const etherfi = ["eETH", "weETH", "weETH.mode"]
  const kelp = ["rsETH", "wrsETH"]
  const lynex = ["inETH", "ainETH"]
  const renzo = ["ezETH"]
  const stakestone = ["STONE"]
  const vector = ["vETH"]
  const yei = ["YEI"]

  const providers = {
    anzen,
    bedrock,
    dolomite,
    ethena,
    etherfi,
    kelp,
    lynex,
    renzo,
    stakestone,
    vector,
    yei,
  }

  const tokensToCover = [
    ...Object.values(providers)
      .map((tokens) => tokens.map((t) => t.toLocaleLowerCase()))
      .flat(),
  ]

  for (const tokenToCover of tokensToCover) {
    const apiVaultsToCover = apiVaults.filter((v) => v.assets.map((a) => a.toLocaleLowerCase()).includes(tokenToCover))
    //console.log(`Checking token ${tokenToCover} with ${apiVaultsToCover.length} vaults`)

    for (const apiVault of apiVaultsToCover) {
      const configVaultFoundById = configVaultById[apiVault.id]
      const configVaultFoundByAddress = configVaultsByAddress[apiVault.earnContractAddress.toLocaleLowerCase()]

      const foundInConfig = configVaultFoundById || configVaultFoundByAddress

      if (!foundInConfig) {
        console.error(
          `ERROR: Vault ${apiVault.id} with token ${tokenToCover} not found in LRT subgraph config by id: ${apiVault.id} or by address: ${apiVault.earnContractAddress}`,
        )
      }
    }
  }

  console.log(`======================== ${chain} done ========================`)
}

const main = async () => {
  const chains = fs
    .readdirSync("./config")
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""))

  for (const chain of chains) {
    await checkConfig({ chain })
  }
}

main()
