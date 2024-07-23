import { Address, DataSourceContext, log, dataSource } from "@graphprotocol/graph-ts"
import { NETWORK_NAME } from "./config"

export const PLATFORM_AAVE = "AAVE"
export const PLATFORM_BALANCER_AURA = "BALANCER_AURA"
export const PLATFORM_CURVE = "CURVE"
export const PLATFORM_GAMMA = "GAMMA"
export const PLATFORM_ICHI_LYNEX = "ICHI_LYNEX"
export const PLATFORM_LYNEX = "LYNEX"
export const PLATFORM_MENDI_LENDING = "MENDI_LENDING"
export const PLATFORM_MENDI_LEVERAGE = "MENDI_LEVERAGE"
export const PLATFORM_NILE = "NILE"
export const PLATFORM_PENDLE_EQUILIBRIA = "PENDLE_EQUILIBRIA"
export const PLATFORM_SOLIDLY = "SOLIDLY"
export const PLATFORM_BEEFY_CLM = "BEEFY_CLM"
export const TRACK_ONLY_SHARE_TOKEN_BALANCE = "TRACK_ONLY_SHARE_TOKEN_BALANCE"
export const TRACK_ONLY_SHARE_AND_UNDERLYING_TOKEN_BALANCE = "TRACK_ONLY_SHARE_AND_UNDERLYING_TOKEN_BALANCE"

export function getChainVaults(): Array<VaultConfig> {
  const vaults = new Array<VaultConfig>()
  const network = NETWORK_NAME as string
  log.debug("getChainVaults: network={}", [network])

  if (network === "arbitrum-one") {
    // retired
    vaults.push(new VaultConfig("equilibria-arb-eeth", PLATFORM_PENDLE_EQUILIBRIA, "0x245d1c493342464ba568BCfb058C1069dFdc07B5"))
    vaults.push(new VaultConfig("equilibria-arb-rseth", PLATFORM_PENDLE_EQUILIBRIA, "0x7975d9EcCe584aDcE00efd16520853Dad66a7775"))
    vaults.push(new VaultConfig("equilibria-arb-ezeth", PLATFORM_PENDLE_EQUILIBRIA, "0x8b479C22c5B33eA4E42395dC7360231B19AF8300"))

    // live
    vaults.push(new VaultConfig("equilibria-arb-seth-ezeth-26sep24", PLATFORM_PENDLE_EQUILIBRIA, "0x6523aFd4658238aa9C8ABA642565b84e2C9E9012"))
    vaults.push(new VaultConfig("equilibria-arb-seth-eeth-26sep24", PLATFORM_PENDLE_EQUILIBRIA, "0x2be03278A177465220ef3C9424Acfd04ebf609b2"))
    vaults.push(new VaultConfig("equilibria-arb-seth-rseth-26sep24", PLATFORM_PENDLE_EQUILIBRIA, "0x9487044D3208Ff03343429F10307f0a23A27dfeC"))
    vaults.push(new VaultConfig("pendle-arb-usde-29aug24", PLATFORM_PENDLE_EQUILIBRIA, "0x631d5C4bA949418D7D856Acc4e33EC2FFF96b590"))
    vaults.push(new VaultConfig("pendle-arb-eeth-26sep24", PLATFORM_PENDLE_EQUILIBRIA, "0xfc0DAB708493b080BAe05cb7a6D6516b53B71dCb"))
    vaults.push(new VaultConfig("pendle-arb-rseth-26sep24", PLATFORM_PENDLE_EQUILIBRIA, "0xcf4D88E8d3496aaEC03A53A05a5cf3da93c2394D"))
    vaults.push(new VaultConfig("pendle-arb-ezeth-26sep24", PLATFORM_PENDLE_EQUILIBRIA, "0xeA4317300Cd4F856B63d8Fc964B3a3Aa64ce712F"))
    vaults.push(new VaultConfig("pendle-arb-dusdc-26sep24", PLATFORM_PENDLE_EQUILIBRIA, "0xf8934BDFe5424D3e8101A73dBAb30f73335106Ea"))
    vaults.push(new VaultConfig("pendle-arb-seth-rseth-26sep24", PLATFORM_PENDLE_EQUILIBRIA, "0xa47D338061c499DBF8dd93a857828762b594d543"))
    vaults.push(new VaultConfig("pendle-arb-seth-eeth-26sep24", PLATFORM_PENDLE_EQUILIBRIA, "0x188E9DF1E12BF43d7d848b2ed5Fe9FED9AAa5155"))
    vaults.push(new VaultConfig("pendle-arb-seth-ezeth-26sep24", PLATFORM_PENDLE_EQUILIBRIA, "0xaD2cd300E6fFd20f620255C2C13251FB1D76F660"))
    vaults.push(new VaultConfig("equilibria-arb-rseth-26sep24-new", PLATFORM_PENDLE_EQUILIBRIA, "0x4897679a3E506F0bedC118250369D782F6CCA03e"))
    vaults.push(new VaultConfig("equilibria-arb-eeth-26sep24", PLATFORM_PENDLE_EQUILIBRIA, "0x4d01a46Fc5F20cA2544204EDD376BdB619BD2D2F"))
    vaults.push(new VaultConfig("equilibria-arb-ezeth-26sep24", PLATFORM_PENDLE_EQUILIBRIA, "0x218337d7DAe070e219c44783A64cA107dffc533e"))
    vaults.push(new VaultConfig("equilibria-arb-ezeth-27jun24", PLATFORM_PENDLE_EQUILIBRIA, "0xdccb85017a996faF5242648B46940E80DE0A36a5"))
    vaults.push(new VaultConfig("equilibria-arb-rseth-27jun24", PLATFORM_PENDLE_EQUILIBRIA, "0x59D0C3f25cB3bD86E03D827C773892d247452227"))
    vaults.push(new VaultConfig("equilibria-arb-eeth-27jun24", PLATFORM_PENDLE_EQUILIBRIA, "0xDDf00Bb25A13e3ECd35a343B9165448cDd2228B6"))
    vaults.push(new VaultConfig("aura-arb-ezeth-wsteth", PLATFORM_BALANCER_AURA, "0xEFAd727469e7e4e410376986AB0af8B6F9559fDc"))
    vaults.push(
      new VaultConfig("uniswap-cow-arb-ezeth-wsteth", PLATFORM_BEEFY_CLM, "0x83368b5e04d8a2c990ef9b5fe41509fafcfba499", [
        "0xe4c1fc47aDB25506E664Af9748a4c3ee98828318",
      ]),
    )
    vaults.push(
      new VaultConfig("uniswap-cow-arb-rseth-wsteth", PLATFORM_BEEFY_CLM, "0x15cfBd3Db5D24360eeac802b3dde4423eb5C3C70", [
        "0x8B0345E218B84274154071614641a501821374A6",
      ]),
    )
    vaults.push(new VaultConfig("aura-arb-rseth-weth", PLATFORM_BALANCER_AURA, "0x764e4e75e3738615CDBFAeaE0C8527b1616e1123"))
  }

  if (network === "base") {
    vaults.push(new VaultConfig("aerodrome-weth-bsdeth", PLATFORM_SOLIDLY, "0xB614A6E6c21202De79DceB95AE2dd4817DD7e14b"))
    vaults.push(new VaultConfig("aerodrome-ezeth-weth", PLATFORM_SOLIDLY, "0xAB7EeE0a368079D2fBfc83599eD0148a16d0Ea09"))
    vaults.push(new VaultConfig("aerodrome-ezeth-weth-s", PLATFORM_SOLIDLY, "0x90A7de0E16CA4521B1E4C3dBBA4edAA2354aB81B"))
    vaults.push(new VaultConfig("aerodrome-weth-wrseth", PLATFORM_SOLIDLY, "0xC5cD1A6d4918820201B8E4eeB6d2AdFD1CDF783d"))
    vaults.push(new VaultConfig("aerodrome-weeth-weth", PLATFORM_SOLIDLY, "0x47579C50c7AeDeA788D18927aed4c827Fe34996A"))
    vaults.push(new VaultConfig("aura-base-weeth-weth", PLATFORM_BALANCER_AURA, "0xc52393b27FeE4355Fe6a5DC92D25BC2Ed1B418Cb"))
    vaults.push(new VaultConfig("aerodrome-usdz-usdc", PLATFORM_SOLIDLY, "0x3b5F990364fa9BF1Db34d9d24B0Bdca6eE4bD4B1"))
  }

  if (network === "mainnet") {
    vaults.push(new VaultConfig("pendle-weethk-26sep24", PLATFORM_PENDLE_EQUILIBRIA, "0xAd182D2Fa5BE2D9025fA3775c1D3111927619fed"))
    vaults.push(new VaultConfig("aura-ezeth-eth", PLATFORM_BALANCER_AURA, "0x3E1c2C604f60ef142AADAA51aa864f8438f2aaC1"))
    vaults.push(new VaultConfig("aura-weeth-reth", PLATFORM_BALANCER_AURA, "0x1153211f7E810C73cC45eE09FF9A0742fBB6b467"))
    vaults.push(new VaultConfig("aura-weeth-ezeth-rseth", PLATFORM_BALANCER_AURA, "0x5dA90BA82bED0AB701E6762D2bF44E08634d9776"))
    vaults.push(
      new VaultConfig("curve-veth", PLATFORM_CURVE, "0xAE0bFfc3110e69DA8993F11C1CBd9a6eA3d16daF", ["0x9Db900bFD1D13112dE2239418eb3D8673B6F1878"]),
    )
  }

  if (network === "linea") {
    vaults.push(new VaultConfig("mendi-linea-ezeth", PLATFORM_AAVE, "0xf711cdcDDa1C5F919c94573cC4E38b4cE2207750"))
    vaults.push(new VaultConfig("mendi-linea-weeth", PLATFORM_AAVE, "0x02B4FD89b702Fb8E2c9443A6c1e45bC40Fb6F7Dc"))
    vaults.push(new VaultConfig("mendi-linea-wrseth", PLATFORM_AAVE, "0x463d5B2F1C387036c883eA953F5A3895797FD2B9"))
    vaults.push(new VaultConfig("lynex-gamma-weeth-weth", PLATFORM_GAMMA, "0xb9A23E2569C262a92635D825142f310BEAfB0Be0"))
    vaults.push(new VaultConfig("lynex-gamma-ineth-wsteth", PLATFORM_GAMMA, "0xAA3b8C08e7Fe86E1dda8FA9FE7423561Ad316e3F"))
    vaults.push(new VaultConfig("nile-ezeth-weth", PLATFORM_SOLIDLY, "0x063091e4532eD93CE93347C6c8338dcA0832ddb0"))

    // mendi soul-bound reward
    vaults.push(new VaultConfig("mendi-linea-lev-wsteth", PLATFORM_MENDI_LEVERAGE, "0xBF71FbCe0d4Fc460D36fa1d13B397a3cd5c45220"))
    vaults.push(new VaultConfig("mendi-linea-lev-weth", PLATFORM_MENDI_LEVERAGE, "0x23EC7f31a5c74D5Fe21aa386A7519028DBD6bA40"))
    vaults.push(new VaultConfig("mendi-linea-lev-usdc", PLATFORM_MENDI_LEVERAGE, "0x9ab545Ab024a8Da2302f5b0D016F4f5501e330d1"))
    vaults.push(new VaultConfig("mendi-linea-lev-usdt", PLATFORM_MENDI_LEVERAGE, "0xC3C757EA1429231C437736746Eb77A2344EAcb81"))
    vaults.push(new VaultConfig("mendi-linea-lev-wbtc", PLATFORM_MENDI_LEVERAGE, "0x639041dD8cD48B52C12414235d97E1313cbbceff"))
  }

  if (network === "optimism") {
    vaults.push(new VaultConfig("velodrome-v2-weth-wrseth", PLATFORM_SOLIDLY, "0xDbE946E16c4e0De9a44065B868265Ac05c437fB6"))
    vaults.push(new VaultConfig("aura-op-weth-wrseth", PLATFORM_BALANCER_AURA, "0x2160BEDE9d5559bA559Eaf88052b46b8364eE245"))
    vaults.push(new VaultConfig("aura-op-wsteth-weeth", PLATFORM_BALANCER_AURA, "0xCF6fC7C5b95caC374400c16CBecd24CBa0cfeAD6"))
    vaults.push(
      new VaultConfig("uniswap-cow-op-rseth-wsteth", PLATFORM_BEEFY_CLM, "0x0f46a74b01708e78c27def7160a5c5222f9dd157", [
        "0xF1748128a1b5c0c45728D09F6f1f60748bC03FE1",
      ]),
    )
  }

  if (network === "bsc") {
    vaults.push(new VaultConfig("thena-gamma-weeth-eth-narrow", PLATFORM_GAMMA, "0xcCcDB0F6eCcd5f231d4737A00C554322167d814B"))
  }

  if (network === "kava") {
    vaults.push(
      new VaultConfig("kinetix-klp", TRACK_ONLY_SHARE_AND_UNDERLYING_TOKEN_BALANCE, "0x9a207D4D2ee8175995C69c0Fb1F117Bf7CcC93cd", [
        "0x7E4bEdE523726283BdF309d49087C3305e681cE0",
      ]),
    )
  }

  if (network === "mode-mainnet") {
    vaults.push(new VaultConfig("velodrome-mode-ezeth-eth", PLATFORM_SOLIDLY, "0x94A3725124d2E71028Ee488b88566f1fb11A90C3"))
    vaults.push(new VaultConfig("velodrome-mode-weeth-eth", PLATFORM_SOLIDLY, "0x6Dd2abBBbbf494dd2454aEd67880B9533E2b3DA1"))
  }

  return vaults
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
export function isRewardPoolAddress(address: Address): boolean {
  const vaults = getChainVaults()
  for (let i = 0; i < vaults.length; i++) {
    for (let j = 0; j < vaults[i].rewardPoolsAddresses.length; j++) {
      if (vaults[i].rewardPoolsAddresses[j].equals(address)) {
        return true
      }
    }
  }

  return false
}

const CONTEXT_KEY_UNDERLYING_PLATFORM = "underlyingPlatform"
const CONTEXT_KEY_VAULT_KEY = "vaultKey"

export function buildVaultDataSourceContext(vault: VaultConfig): DataSourceContext {
  let context = new DataSourceContext()
  context.setString(CONTEXT_KEY_UNDERLYING_PLATFORM, vault.underlyingPlatform)
  context.setString(CONTEXT_KEY_VAULT_KEY, vault.vaultKey)
  return context
}

export function getContextUnderlyingPlatform(): string {
  let context = dataSource.context()
  return context.getString(CONTEXT_KEY_UNDERLYING_PLATFORM)
}

export function getContextVaultKey(): string {
  let context = dataSource.context()
  return context.getString(CONTEXT_KEY_VAULT_KEY)
}

class VaultConfig {
  public vaultKey: string
  public underlyingPlatform: string
  public address: Address
  public boostAddresses: Array<Address>
  public rewardPoolsAddresses: Array<Address>

  constructor(vaultKey: string, underlyingPlatform: string, vault: string, boostsOrRewardPools: Array<string> = []) {
    this.vaultKey = vaultKey
    this.underlyingPlatform = underlyingPlatform
    this.address = Address.fromString(vault)
    this.boostAddresses = new Array<Address>()
    this.rewardPoolsAddresses = new Array<Address>()

    if (underlyingPlatform === PLATFORM_BEEFY_CLM) {
      for (let i = 0; i < boostsOrRewardPools.length; i++) {
        this.rewardPoolsAddresses.push(Address.fromString(boostsOrRewardPools[i]))
      }
    } else {
      for (let i = 0; i < boostsOrRewardPools.length; i++) {
        this.boostAddresses.push(Address.fromString(boostsOrRewardPools[i]))
      }
    }
  }
}
