import { Address, log } from "@graphprotocol/graph-ts"
import { NETWORK_NAME } from "./config"

class VaultConfig {
  public address: Address
  public boostAddresses: Array<Address>
  constructor(vault: string, boosts: Array<string> = []) {
    this.address = Address.fromString(vault)
    this.boostAddresses = new Array<Address>()
    for (let i = 0; i < boosts.length; i++) {
      this.boostAddresses.push(Address.fromString(boosts[i]))
    }
  }
}

export function getChainVaults(): Array<VaultConfig> {
  const vaults = new Array<VaultConfig>()
  const network = NETWORK_NAME as string

  if (network === "arbitrum-one") {
    // equilibria-arb-eeth
    vaults.push(new VaultConfig("0x245d1c493342464ba568BCfb058C1069dFdc07B5"))
    // equilibria-arb-rseth
    vaults.push(new VaultConfig("0x7975d9EcCe584aDcE00efd16520853Dad66a7775"))
    // equilibria-arb-ezeth-27jun24
    vaults.push(new VaultConfig("0xdccb85017a996faF5242648B46940E80DE0A36a5"))
    // equilibria-arb-rseth-27jun24
    vaults.push(new VaultConfig("0x59D0C3f25cB3bD86E03D827C773892d247452227"))
    // equilibria-arb-eeth-27jun24
    vaults.push(new VaultConfig("0xDDf00Bb25A13e3ECd35a343B9165448cDd2228B6"))
  }

  if (network === "base") {
    // aerodrome-ezeth-weth
    vaults.push(new VaultConfig("0xAB7EeE0a368079D2fBfc83599eD0148a16d0Ea09"))
    // aerodrome-ezeth-weth-s
    vaults.push(new VaultConfig("0x90A7de0E16CA4521B1E4C3dBBA4edAA2354aB81B"))
  }

  if (network === "mainnet") {
    // aura-ezeth-eth
    vaults.push(new VaultConfig("0x3E1c2C604f60ef142AADAA51aa864f8438f2aaC1"))
    // aura-weeth-reth
    vaults.push(new VaultConfig("0x1153211f7E810C73cC45eE09FF9A0742fBB6b467"))
    // aura-weeth-ezeth-rseth
    vaults.push(new VaultConfig("0x5dA90BA82bED0AB701E6762D2bF44E08634d9776"))
    // curve-veth
    vaults.push(
      new VaultConfig("0xAE0bFfc3110e69DA8993F11C1CBd9a6eA3d16daF", ["0x9Db900bFD1D13112dE2239418eb3D8673B6F1878"]),
    )
  }

  if (network === "linea") {
    // mendi-linea-ezeth
    vaults.push(new VaultConfig("0xf711cdcDDa1C5F919c94573cC4E38b4cE2207750"))
    // lynex-gamma-ezeth-weth
    vaults.push(new VaultConfig("0x35884E8C569b9f7714A35EDf056A82535A43F5AD"))
  }

  return vaults
}

export function getBoostAddresses(vaultAddress: Address): Array<Address> {
  const vaults = getChainVaults()
  for (let i = 0; i < vaults.length; i++) {
    if (vaults[i].address.equals(vaultAddress)) {
      return vaults[i].boostAddresses
    }
  }

  log.error("getBoostAddresses: Vault not found {}", [vaultAddress.toHexString()])
  throw new Error("Vault not found")
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
