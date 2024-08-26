import { VaultConfig, _getChainVaults } from "../src/vault-config"
import * as fs from "fs"

const checkConfig = async ({ apiChain: chain, subgraphChain }: { apiChain: string; subgraphChain: string }) => {
  console.log(`\n================================================`)
  console.log(`\n======================== ${chain} ========================`)
  let hasErrors = false
  // fetch vault config from https://api.beefy.com/vaults

  type ApiVault = {
    id: string
    assets: string[]
    earnContractAddress: string
    pointStructureIds?: string[]
    platformId?: string
  }

  interface ApiPointsStructure {
    id: string
    docs: string
    points: {
      id: string
      name: string
    }[]
    eligibility: Array<
      | { type: "token-holding"; tokens: string[] }
      | { type: "vault-whitelist" }
      | { type: "on-chain-lp"; chain: string }
      | { type: "token-on-platform"; platform: string; tokens: string[] }
    >
    accounting: {
      id: string
      role: string
      url?: string
    }[]
  }

  interface ApiBoost {
    id: string
    poolId: string // vault id
    tokenAddress: string // vault address
    earnContractAddress: string // address of the boost contract
  }

  interface ApiGovVault {
    id: string
    version?: number
    tokenAddress: string // clm manager address
    earnContractAddress: string // reward pool address
  }

  const [classicVaults, cowVaults, boosts, govVaults, pointsStructures] = await Promise.all([
    await fetch(`https://api.beefy.finance/vaults/${chain}`).then((res): Promise<ApiVault[]> => res.json()),
    await fetch(`https://api.beefy.finance/cow-vaults/${chain}`).then((res): Promise<ApiVault[]> => res.json()),
    await fetch(`https://api.beefy.finance/boosts/${chain}`).then((res): Promise<ApiBoost[]> => res.json()),
    await fetch(`https://api.beefy.finance/gov-vaults/${chain}`).then((res): Promise<ApiGovVault[]> => res.json()),
    await fetch(`https://api.beefy.finance/points-structures`).then((res): Promise<ApiPointsStructure[]> => res.json()),
  ])

  const pointsStructuresSupportedByThisSubgraph = pointsStructures.filter((p) => p.accounting.some((e) => e.id === "beefy-lrt-subgraph"))
  const supportedPointsStructuresById = pointsStructuresSupportedByThisSubgraph.reduce(
    (acc, p) => {
      acc[p.id] = p
      return acc
    },
    {} as Record<string, ApiPointsStructure>,
  )

  const allApiVaults = classicVaults.concat(cowVaults)
  const apiVaultsSupportedByThisSubgraph = allApiVaults.filter((v) => v.pointStructureIds?.some((id) => !!supportedPointsStructuresById[id]))
  const configVaults = _getChainVaults(subgraphChain)

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

  const boostsByPoolId = boosts.reduce(
    (acc, b) => {
      acc[b.poolId] = acc[b.poolId] || []
      acc[b.poolId].push(b)
      return acc
    },
    {} as Record<string, Array<ApiBoost>>,
  )
  const govVaultsByWantAddress = govVaults.reduce(
    (acc, v) => {
      acc[v.tokenAddress.toLocaleLowerCase()] = acc[v.tokenAddress.toLocaleLowerCase()] || []
      acc[v.tokenAddress.toLocaleLowerCase()].push(v)
      return acc
    },
    {} as Record<string, Array<ApiGovVault>>,
  )

  console.log("\n========= Checking for vaults declared as earning points but not in the subgraph config ===")

  for (const apiVault of apiVaultsSupportedByThisSubgraph) {
    const configVaultFoundById = configVaultById[apiVault.id]
    const configVaultFoundByAddress = configVaultsByAddress[apiVault.earnContractAddress.toLocaleLowerCase()]

    const foundInConfig = configVaultFoundById || configVaultFoundByAddress
    if (!foundInConfig) {
      hasErrors = true
      console.error(
        `ERROR: Vault ${apiVault.id} not found in LRT subgraph config by id: ${apiVault.id} or by address: ${apiVault.earnContractAddress}`,
      )

      const boostsOrRewardPoolAddresses = [
        ...(govVaultsByWantAddress[apiVault.earnContractAddress.toLocaleLowerCase()] || []),
        ...(boostsByPoolId[apiVault.id] || []),
      ]
        .map((v) => `"${v.earnContractAddress}"`)
        .join(", ")

      console.log(
        `code to add: vaults.push(new VaultConfig("${apiVault.id}", PLATFORM_xxxx, "${apiVault.earnContractAddress}"${
          boostsOrRewardPoolAddresses.length > 0 ? `, [${boostsOrRewardPoolAddresses}]` : ""
        }))`,
      )
    } else if (!configVaultFoundByAddress) {
      console.warn(
        `WARN: Vault with id ${apiVault.id} has incorrect address ${configVaultFoundById.address} instead of ${apiVault.earnContractAddress}`,
      )
    }
  }

  console.log("\n========= Checking for vaults in the subgraph config but not declared as earning points ===")
  for (const configVault of configVaults) {
    const apiVaultFoundById = allApiVaults.find((v) => v.id === configVault.vaultKey)
    const apiVaultFoundByAddress = allApiVaults.find((v) => v.earnContractAddress.toLocaleLowerCase() === configVault.address.toLocaleLowerCase())

    const apiVaultFound = apiVaultFoundById || apiVaultFoundByAddress
    if (!apiVaultFound) {
      //hasErrors = true
      console.error(`WARN: Vault ${configVault.vaultKey} found in LRT subgraph config but not in api`)
    } else if (!apiVaultFoundByAddress) {
      console.warn(
        `WARN: Vault with id ${configVault.vaultKey} has incorrect address ${configVault.address} instead of ${apiVaultFound.earnContractAddress}`,
      )
    } else if (!apiVaultFoundById) {
      console.warn(`WARN: Vault with address ${configVault.address} has incorrect id ${configVault.vaultKey} instead of ${apiVaultFound.id}`)
    } else if (!apiVaultFound.pointStructureIds || apiVaultFound.pointStructureIds.length === 0) {
      console.warn(`WARN: Vault ${configVault.vaultKey} is not declared as earning points in the api`)
    } else {
      const pointsStructuresIds = apiVaultFound.pointStructureIds
      let needsThisSubgraph = false
      for (const id of pointsStructuresIds) {
        const pointsStructure = supportedPointsStructuresById[id]
        if (pointsStructure) {
          needsThisSubgraph = true
        }
      }

      if (!needsThisSubgraph) {
        console.warn(`WARN: Vault ${configVault.vaultKey} is declared as not needing this subgraph in the api but is present in this config`)
      }
    }
  }

  console.log("\n========= Checking for duplicate vaults in configuration ===")
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

  console.log("\n========= Checking boost and reward pools configs ===")
  for (const configVault of configVaults) {
    const boostsForVault = boostsByPoolId[configVault.vaultKey] || []
    const rewardPoolsForVault = govVaultsByWantAddress[configVault.address.toLocaleLowerCase()] || []

    for (const boost of boostsForVault) {
      const foundInBoosts = configVault.boostAddresses.some((b) => b.toLocaleLowerCase() === boost.earnContractAddress.toLocaleLowerCase())
      const foundInRewardPools = configVault.rewardPoolsAddresses.some(
        (rp) => rp.toLocaleLowerCase() === boost.earnContractAddress.toLocaleLowerCase(),
      )
      if (!foundInBoosts && !foundInRewardPools) {
        hasErrors = true
        console.error(`ERROR: Boost or RP ${boost.earnContractAddress} for vault ${configVault.vaultKey} not found in config`)
      }
    }

    for (const rewardPool of rewardPoolsForVault) {
      const foundInBoosts = configVault.boostAddresses.some((b) => b.toLocaleLowerCase() === rewardPool.earnContractAddress.toLocaleLowerCase())
      const foundInRewardPools = configVault.rewardPoolsAddresses.some(
        (rp) => rp.toLocaleLowerCase() === rewardPool.earnContractAddress.toLocaleLowerCase(),
      )
      if (!foundInBoosts && !foundInRewardPools) {
        hasErrors = true
        console.error(`ERROR: Boost or RP ${rewardPool.earnContractAddress} for vault ${configVault.vaultKey} not found in config`)
      }
    }

    // check for duplicate boosts or reward pools in config
    const boostCountsByAddy = configVault.boostAddresses.concat(configVault.rewardPoolsAddresses).reduce(
      (acc, b) => {
        acc[b.toLocaleLowerCase()] = (acc[b.toLocaleLowerCase()] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
    for (const [address, count] of Object.entries(boostCountsByAddy)) {
      if (count > 1) {
        hasErrors = true
        console.error(`ERROR: Duplicate boost or RP for address ${address} for vault ${configVault.vaultKey}`)
      }
    }

    // check for boosts or reward pools in config that are not in the api
    for (const boostAddress of configVault.boostAddresses) {
      const foundInApiBoosts = boosts.some((b) => b.earnContractAddress.toLocaleLowerCase() === boostAddress.toLocaleLowerCase())
      const foundInApiGovVaults = govVaults.some((v) => v.earnContractAddress.toLocaleLowerCase() === boostAddress.toLocaleLowerCase())
      if (!foundInApiBoosts && !foundInApiGovVaults) {
        hasErrors = true
        console.error(`ERROR: Boost ${boostAddress} for vault ${configVault.vaultKey} not found in api`)
      }
    }
    for (const rewardPoolAddress of configVault.rewardPoolsAddresses) {
      const foundInApiBoosts = boosts.some((b) => b.earnContractAddress.toLocaleLowerCase() === rewardPoolAddress.toLocaleLowerCase())
      const foundInApiGovVaults = govVaults.some((v) => v.earnContractAddress.toLocaleLowerCase() === rewardPoolAddress.toLocaleLowerCase())
      if (!foundInApiBoosts && !foundInApiGovVaults) {
        hasErrors = true
        console.error(`ERROR: RP ${rewardPoolAddress} for vault ${configVault.vaultKey} not found in api`)
      }
    }
  }
  if (!hasErrors) {
    console.log(`\n======================== PASSED ========================`)
  } else {
    console.log(`\nERROR: ======================== FAILED ========================`)
  }

  return hasErrors
}

const main = async () => {
  const chains = await fetch("https://api.beefy.finance/config")
    .then((res) => res.json())
    .then((res) => Object.keys(res))

  let hasErrors = false
  for (const chain of chains) {
    let subgraphChain = chain
    if (fs.existsSync(`./config/${chain}.json`)) {
      const content = fs.readFileSync(`./config/${chain}.json`, "utf-8")
      const { network } = JSON.parse(content)
      subgraphChain = network
    }
    const chainHasErrors = await checkConfig({ apiChain: chain, subgraphChain })
    hasErrors = hasErrors || chainHasErrors
  }

  if (hasErrors) {
    console.error("Errors found")
    process.exit(1)
  } else {
    console.log("All checks passed")
    process.exit(0)
  }
}

main()
