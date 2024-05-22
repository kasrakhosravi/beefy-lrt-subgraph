import { Address, DataSourceContext, log, dataSource, BigInt } from "@graphprotocol/graph-ts"
import { NETWORK_NAME } from "./config"
import { BeefyVault } from "../generated/schema"
import { ONE_BI, ZERO_BD, ZERO_BI } from "./utils/decimal"

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

class TrackingFeatureFlags {
  constructor(
    /**
     * for all of those:
     * - set to 0 if we don't want to track
     * - set to 1 to track all blocks
     * - set to a block number to start tracking from that block
     */
    public startTrackingInvestorBalanceBreakdownAtBlock: BigInt,
    public startTrackingInvestorTokenBalanceSnapshotsAtBlock: BigInt,
  ) {
    if (startTrackingInvestorBalanceBreakdownAtBlock.lt(ZERO_BI)) {
      throw new Error("startTrackingTimeWeightedBalanceAtBlock should be >= 0")
    }
    if (startTrackingInvestorTokenBalanceSnapshotsAtBlock.lt(ZERO_BI)) {
      throw new Error("startTrackingInvestorTokenBalanceSnapshotsAtBlock should be >= 0")
    }
  }

  public shouldTrackInvestorBalanceBreakdown(blockNumber: BigInt): boolean {
    return this.shouldTrack(this.startTrackingInvestorBalanceBreakdownAtBlock, blockNumber)
  }

  public shouldTrackInvestorTokenBalanceSnapshot(blockNumber: BigInt): boolean {
    return this.shouldTrack(this.startTrackingInvestorTokenBalanceSnapshotsAtBlock, blockNumber)
  }

  private shouldTrack(startBlock: BigInt, blockNumber: BigInt): boolean {
    if (startBlock.equals(ZERO_BI)) {
      return false
    }
    return blockNumber.ge(startBlock)
  }
}

class VaultConfig {
  public vaultKey: string
  public underlyingPlatform: string
  public address: Address
  public boostAddresses: Array<Address>
  public featureFlags: TrackingFeatureFlags
  constructor(vaultKey: string, underlyingPlatform: string, vault: string, featureFlags: TrackingFeatureFlags, boosts: Array<string> = []) {
    this.vaultKey = vaultKey
    this.underlyingPlatform = underlyingPlatform
    this.address = Address.fromString(vault)
    this.boostAddresses = new Array<Address>()
    for (let i = 0; i < boosts.length; i++) {
      this.boostAddresses.push(Address.fromString(boosts[i]))
    }

    this.featureFlags = featureFlags
  }
}

export function getChainVaults(): Array<VaultConfig> {
  const vaults = new Array<VaultConfig>()
  const network = NETWORK_NAME as string

  const bb = new TrackingFeatureFlags(ONE_BI, ZERO_BI)

  if (network === "arbitrum-one") {
    vaults.push(new VaultConfig("equilibria-arb-eeth", PLATFORM_PENDLE_EQUILIBRIA, "0x245d1c493342464ba568BCfb058C1069dFdc07B5", bb))
    vaults.push(new VaultConfig("equilibria-arb-rseth", PLATFORM_PENDLE_EQUILIBRIA, "0x7975d9EcCe584aDcE00efd16520853Dad66a7775", bb))
    vaults.push(new VaultConfig("equilibria-arb-ezeth-27jun24", PLATFORM_PENDLE_EQUILIBRIA, "0xdccb85017a996faF5242648B46940E80DE0A36a5", bb))
    vaults.push(new VaultConfig("equilibria-arb-rseth-27jun24", PLATFORM_PENDLE_EQUILIBRIA, "0x59D0C3f25cB3bD86E03D827C773892d247452227", bb))
    vaults.push(new VaultConfig("equilibria-arb-eeth-27jun24", PLATFORM_PENDLE_EQUILIBRIA, "0xDDf00Bb25A13e3ECd35a343B9165448cDd2228B6", bb))
    vaults.push(new VaultConfig("aura-arb-ezeth-wsteth", PLATFORM_BALANCER_AURA, "0xEFAd727469e7e4e410376986AB0af8B6F9559fDc", bb))
  }

  if (network === "base") {
    vaults.push(new VaultConfig("aerodrome-ezeth-weth", PLATFORM_SOLIDLY, "0xAB7EeE0a368079D2fBfc83599eD0148a16d0Ea09", bb))
    vaults.push(new VaultConfig("aerodrome-ezeth-weth-s", PLATFORM_SOLIDLY, "0x90A7de0E16CA4521B1E4C3dBBA4edAA2354aB81B", bb))
    vaults.push(new VaultConfig("aerodrome-weth-wrseth", PLATFORM_SOLIDLY, "0xC5cD1A6d4918820201B8E4eeB6d2AdFD1CDF783d", bb))
    vaults.push(new VaultConfig("aerodrome-weeth-weth", PLATFORM_SOLIDLY, "0x47579C50c7AeDeA788D18927aed4c827Fe34996A", bb))
  }

  if (network === "mainnet") {
    vaults.push(new VaultConfig("aura-ezeth-eth", PLATFORM_BALANCER_AURA, "0x3E1c2C604f60ef142AADAA51aa864f8438f2aaC1", bb))
    vaults.push(new VaultConfig("aura-weeth-reth", PLATFORM_BALANCER_AURA, "0x1153211f7E810C73cC45eE09FF9A0742fBB6b467", bb))
    vaults.push(new VaultConfig("aura-weeth-ezeth-rseth", PLATFORM_BALANCER_AURA, "0x5dA90BA82bED0AB701E6762D2bF44E08634d9776", bb))
    vaults.push(
      new VaultConfig("curve-veth", PLATFORM_CURVE, "0xAE0bFfc3110e69DA8993F11C1CBd9a6eA3d16daF", bb, ["0x9Db900bFD1D13112dE2239418eb3D8673B6F1878"]),
    )
  }

  if (network === "linea") {
    const LINEA_TVL_TRACKING_START_BLOCK = BigInt.fromI32(4735200) // may 21th 2024
    const all = new TrackingFeatureFlags(ONE_BI, LINEA_TVL_TRACKING_START_BLOCK)
    const bs = new TrackingFeatureFlags(ZERO_BI, LINEA_TVL_TRACKING_START_BLOCK)

    // points tracking, we need all the breakdowns + snapshots
    vaults.push(new VaultConfig("mendi-linea-ezeth", PLATFORM_AAVE, "0xf711cdcDDa1C5F919c94573cC4E38b4cE2207750", all))
    vaults.push(new VaultConfig("lynex-gamma-ezeth-weth", PLATFORM_GAMMA, "0x35884E8C569b9f7714A35EDf056A82535A43F5AD", all))
    vaults.push(new VaultConfig("lynex-gamma-weeth-weth", PLATFORM_GAMMA, "0xb9A23E2569C262a92635D825142f310BEAfB0Be0", all))
    vaults.push(new VaultConfig("mendi-linea-lev-wsteth", PLATFORM_MENDI_LEVERAGE, "0xBF71FbCe0d4Fc460D36fa1d13B397a3cd5c45220", all))
    vaults.push(new VaultConfig("mendi-linea-lev-weth", PLATFORM_MENDI_LEVERAGE, "0x23EC7f31a5c74D5Fe21aa386A7519028DBD6bA40", all))
    vaults.push(new VaultConfig("mendi-linea-lev-usdc", PLATFORM_MENDI_LEVERAGE, "0x9ab545Ab024a8Da2302f5b0D016F4f5501e330d1", all))
    vaults.push(new VaultConfig("mendi-linea-lev-usdt", PLATFORM_MENDI_LEVERAGE, "0xC3C757EA1429231C437736746Eb77A2344EAcb81", all))
    vaults.push(new VaultConfig("mendi-linea-lev-wbtc", PLATFORM_MENDI_LEVERAGE, "0x639041dD8cD48B52C12414235d97E1313cbbceff", all))
    vaults.push(new VaultConfig("nile-ezeth-weth", PLATFORM_SOLIDLY, "0x063091e4532eD93CE93347C6c8338dcA0832ddb0", all))

    // all other vaults are for linea tvl tracking only
    vaults.push(new VaultConfig("lynex-gamma-stone-weth", PLATFORM_GAMMA, "0x1C973f35325947f30F20fE1189605A332FD9F40F", bs))
    vaults.push(new VaultConfig("lynex-gamma-usdc-lynx", PLATFORM_GAMMA, "0x50fA947b08F879004220C42428524eaaf4eF9473", bs))
    vaults.push(new VaultConfig("lynex-gamma-usdc-weth", PLATFORM_GAMMA, "0xe269c87F85C725bb9BF642aAeE1650bf5796B73B", bs))
    vaults.push(new VaultConfig("lynex-gamma-usdt-weth", PLATFORM_GAMMA, "0x7168464Ac7330EC5177694005e60FBe319DC40c2", bs))
    vaults.push(new VaultConfig("lynex-gamma-wbtc-weth", PLATFORM_GAMMA, "0x8c0919AE1fAcD6695Ad236Ea618d1018e5c4d42c", bs))
    vaults.push(new VaultConfig("lynex-gamma-wsteth-weth", PLATFORM_GAMMA, "0xcAF1A883e63bb8C3E6f099C7A2044c07112883ca", bs))
    vaults.push(new VaultConfig("lynex-ichi-stone-lynx", PLATFORM_ICHI_LYNEX, "0x5AB215b3C42f97165Ab43e7FA7609cc8F8D68817", bs))
    vaults.push(new VaultConfig("lynex-ichi-usdc-lynx", PLATFORM_ICHI_LYNEX, "0x6c43Dff83D1F2936A69CcC1D10351eC6F5aDDAce", bs))
    vaults.push(new VaultConfig("lynex-ichi-usdt-lynx", PLATFORM_ICHI_LYNEX, "0x24F41b9246E6F96d8e11ba40475752BA052Fb4b2", bs))
    vaults.push(new VaultConfig("lynex-ichi-wbtc-weth", PLATFORM_ICHI_LYNEX, "0x79356b87C9cDE886e97D0F6b8F2f758e7A6a8878", bs))
    vaults.push(new VaultConfig("lynex-ichi-weth-lynx", PLATFORM_ICHI_LYNEX, "0x6DfF00F764a7797C8F8e1DD5624Db039192B3c76", bs))
    vaults.push(new VaultConfig("lynex-stone-weth", PLATFORM_LYNEX, "0x1C8cfC0cFf01D59f2e4d6F547EE227Af869EfA07", bs))
    vaults.push(new VaultConfig("lynex-usdc-mai", PLATFORM_LYNEX, "0xc8F789da67E392e0C14dcD6C81404884199d9849", bs))
    vaults.push(new VaultConfig("lynex-usdc-mendi", PLATFORM_LYNEX, "0x84237d2a5f8bD4e9D89F6156043E79d9D7Ed4367", bs))
    vaults.push(new VaultConfig("lynex-usdc-usd+", PLATFORM_LYNEX, "0x046c7CDfEd34d1DA367AC2db79135c24AF29acFf", bs))
    vaults.push(new VaultConfig("lynex-usdc-usdt", PLATFORM_LYNEX, "0x5730Ba155FD95903c2706f1B2F8DBbBFB5e0a94c", bs))
    vaults.push(new VaultConfig("lynex-usdt+-usd+", PLATFORM_LYNEX, "0x1AE57Bb562ce546032e52f755C0B7030D28Bcd47", bs))
    vaults.push(new VaultConfig("lynex-wsteth-weth", PLATFORM_LYNEX, "0x4859ac3c9aC0A9c35Dc807f79B78f7b9a6F4e7E4", bs))
    vaults.push(new VaultConfig("mendi-linea-dai", PLATFORM_MENDI_LENDING, "0xb227116Fa19ABb3a94655dDF24E9CFa09c58d154", bs))
    vaults.push(new VaultConfig("mendi-linea-usdc", PLATFORM_MENDI_LENDING, "0xE7e6a718218d737945E6f039c161D3C3c550CBA8", bs))
    vaults.push(new VaultConfig("mendi-linea-usdt", PLATFORM_MENDI_LENDING, "0xc46833F6217Db6586fD129cC2f61361dfCE4c21D", bs))
    vaults.push(new VaultConfig("mendi-linea-wbtc", PLATFORM_MENDI_LENDING, "0x879F6c5A0CEC83006771b0c271e644b635dC9666", bs))
    vaults.push(new VaultConfig("mendi-linea-weth", PLATFORM_MENDI_LENDING, "0x3d80b49fc4DC9E450efAc1BD34cdEB2F303c2E81", bs))
    vaults.push(new VaultConfig("mendi-linea-wsteth", PLATFORM_MENDI_LENDING, "0x03BdAf7eb1b109E3C3348ee98cde734a82aea8FD", bs))
    vaults.push(new VaultConfig("nile-usdc-lusd", PLATFORM_NILE, "0x7A6A9dEb7dFfA150224ece4d381f327C59a6bBab", bs))
  }

  if (network === "optimism") {
    vaults.push(new VaultConfig("velodrome-v2-weth-wrseth", PLATFORM_SOLIDLY, "0xDbE946E16c4e0De9a44065B868265Ac05c437fB6", bb))
  }

  if (network === "bsc") {
    vaults.push(new VaultConfig("thena-gamma-weeth-eth-narrow", PLATFORM_GAMMA, "0xcCcDB0F6eCcd5f231d4737A00C554322167d814B", bb))
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

export function getVaultFeatureFlags(vault: BeefyVault): TrackingFeatureFlags {
  return new TrackingFeatureFlags(vault.startTrackingInvestorBalanceBreakdownAtBlock, vault.startTrackingInvestorTokenBalanceSnapshotsAtBlock)
}

const CONTEXT_KEY_UNDERLYING_PLATFORM = "underlyingPlatform"
const CONTEXT_KEY_VAULT_KEY = "vaultKey"
const CONTEXT_KEY_FEATURE_FLAG_START_TRACKING_INVESTOR_BALANCE_BREAKDOWN_AT_BLOCK = "startTrackingInvestorBalanceBreakdownAtBlock"
const CONTEXT_KEY_FEATURE_FLAG_START_TRACKING_INVESTOR_TOKEN_BALANCE_SNAPSHOTS_AT_BLOCK = "startTrackingInvestorTokenBalanceSnapshotsAtBlock"

export function buildVaultDataSourceContext(vault: VaultConfig): DataSourceContext {
  let context = new DataSourceContext()
  context.setString(CONTEXT_KEY_UNDERLYING_PLATFORM, vault.underlyingPlatform)
  context.setString(CONTEXT_KEY_VAULT_KEY, vault.vaultKey)
  context.setBigInt(
    CONTEXT_KEY_FEATURE_FLAG_START_TRACKING_INVESTOR_BALANCE_BREAKDOWN_AT_BLOCK,
    vault.featureFlags.startTrackingInvestorBalanceBreakdownAtBlock,
  )
  context.setBigInt(
    CONTEXT_KEY_FEATURE_FLAG_START_TRACKING_INVESTOR_TOKEN_BALANCE_SNAPSHOTS_AT_BLOCK,
    vault.featureFlags.startTrackingInvestorTokenBalanceSnapshotsAtBlock,
  )
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

export function getContextFeatureFlags(): TrackingFeatureFlags {
  let context = dataSource.context()
  return new TrackingFeatureFlags(
    context.getBigInt(CONTEXT_KEY_FEATURE_FLAG_START_TRACKING_INVESTOR_BALANCE_BREAKDOWN_AT_BLOCK),
    context.getBigInt(CONTEXT_KEY_FEATURE_FLAG_START_TRACKING_INVESTOR_TOKEN_BALANCE_SNAPSHOTS_AT_BLOCK),
  )
}
