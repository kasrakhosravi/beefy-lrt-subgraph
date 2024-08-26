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
export const PLATFORM_BEEFY_CLM_VAULT = "BEEFY_CLM_VAULT"
export const TRACK_ONLY_SHARE_TOKEN_BALANCE = "TRACK_ONLY_SHARE_TOKEN_BALANCE"
export const TRACK_ONLY_SHARE_AND_UNDERLYING_TOKEN_BALANCE = "TRACK_ONLY_SHARE_AND_UNDERLYING_TOKEN_BALANCE"

export function _getChainVaults(network: string): Array<VaultConfig> {
  const vaults = new Array<VaultConfig>()
  if (network === "arbitrum-one") {
    vaults.push(new VaultConfig("aura-arb-ezeth-wsteth", PLATFORM_BALANCER_AURA, "0xEFAd727469e7e4e410376986AB0af8B6F9559fDc", ["0xfcF293AFa58fa277935eddAa44E0f782EC41B09B"]))
    vaults.push(new VaultConfig("aura-arb-rseth-weth", PLATFORM_BALANCER_AURA, "0x764e4e75e3738615CDBFAeaE0C8527b1616e1123"))
    vaults.push(new VaultConfig("camelot-ezeth-weth", PLATFORM_BEEFY_CLM, "0x663B0d9ddB6e86cB5E1F87ebCbDafb5A53a45798", ["0xf1ff0F8793DbA18dF40E8b8aff66CE6f7a9DF945"]))
    vaults.push(new VaultConfig("camelot-rseth-weth", PLATFORM_BEEFY_CLM, "0xac8246F01197fB783Bf1A80960821835045Ec680", ["0xD9001574E23fb909657A25494f540A9B3804b16e"]))
    vaults.push(new VaultConfig("camelot-usde-usdc", PLATFORM_BEEFY_CLM, "0xC9a57BAD9AAbCC6f0c22474442985b7CF1eC6786", ["0xC66F3928D2653B82367B4B7B2d3E3B43f4A1f647"]))
    vaults.push(new VaultConfig("equilibria-arb-ezeth-26sep24", PLATFORM_PENDLE_EQUILIBRIA, "0x218337d7DAe070e219c44783A64cA107dffc533e"))
    vaults.push(new VaultConfig("equilibria-arb-ezeth-27jun24", PLATFORM_PENDLE_EQUILIBRIA, "0xdccb85017a996faF5242648B46940E80DE0A36a5"))
    vaults.push(new VaultConfig("equilibria-arb-rseth-26sep24-new", PLATFORM_PENDLE_EQUILIBRIA, "0x4897679a3E506F0bedC118250369D782F6CCA03e"))
    vaults.push(new VaultConfig("equilibria-arb-rseth-26sep24", PLATFORM_PENDLE_EQUILIBRIA, "0x66d89d65046D8BC75E0fb14E704e50E8C7a07219"))
    vaults.push(new VaultConfig("equilibria-arb-rseth-27jun24", PLATFORM_PENDLE_EQUILIBRIA, "0x59D0C3f25cB3bD86E03D827C773892d247452227"))
    vaults.push(new VaultConfig("equilibria-arb-rseth", PLATFORM_PENDLE_EQUILIBRIA, "0x7975d9EcCe584aDcE00efd16520853Dad66a7775"))
    vaults.push(new VaultConfig("equilibria-arb-seth-ezeth-26sep24", PLATFORM_PENDLE_EQUILIBRIA, "0x6523aFd4658238aa9C8ABA642565b84e2C9E9012"))
    vaults.push(new VaultConfig("equilibria-arb-seth-rseth-26sep24", PLATFORM_PENDLE_EQUILIBRIA, "0x9487044D3208Ff03343429F10307f0a23A27dfeC"))
    vaults.push(new VaultConfig("pancake-cow-arb-rseth-weth-vault", PLATFORM_BEEFY_CLM_VAULT, "0x70a9DC4c4c4ea1A621c174e3F438582fA7C99BFA"))
    vaults.push(new VaultConfig("pancake-cow-arb-rseth-weth", PLATFORM_BEEFY_CLM, "0x5c1f30297b7997601a2ae2957cdc95cd4783e544", ["0x3ec0e7Bf0DCDA562d67d8d7F27569AA0be080DAb"]))
    vaults.push(new VaultConfig("pendle-arb-dusdc-26sep24", PLATFORM_PENDLE_EQUILIBRIA, "0xf8934BDFe5424D3e8101A73dBAb30f73335106Ea"))
    vaults.push(new VaultConfig("pendle-arb-ezeth-26sep24", PLATFORM_PENDLE_EQUILIBRIA, "0xeA4317300Cd4F856B63d8Fc964B3a3Aa64ce712F"))
    vaults.push(new VaultConfig("pendle-arb-rseth-26sep24", PLATFORM_PENDLE_EQUILIBRIA, "0xcf4D88E8d3496aaEC03A53A05a5cf3da93c2394D"))
    vaults.push(new VaultConfig("pendle-arb-seth-ezeth-26sep24", PLATFORM_PENDLE_EQUILIBRIA, "0xaD2cd300E6fFd20f620255C2C13251FB1D76F660"))
    vaults.push(new VaultConfig("pendle-arb-seth-rseth-26sep24", PLATFORM_PENDLE_EQUILIBRIA, "0xa47D338061c499DBF8dd93a857828762b594d543"))
    vaults.push(new VaultConfig("pendle-arb-unieth-26dec24", PLATFORM_PENDLE_EQUILIBRIA, "0xabe6199ad847F05f1E93B005f3850793b8DF7c9c"))
    vaults.push(new VaultConfig("pendle-arb-usde-28nov24", PLATFORM_PENDLE_EQUILIBRIA, "0xEA66381184De8FD7C28869c3C055618107DD1b90"))
    vaults.push(new VaultConfig("pendle-arb-usde-29aug24", PLATFORM_PENDLE_EQUILIBRIA, "0x631d5C4bA949418D7D856Acc4e33EC2FFF96b590"))
    vaults.push(new VaultConfig("ramses-cl-rseth-ethx-vault", PLATFORM_BEEFY_CLM_VAULT, "0x4fCf6A05a7F1A5BA2781d7De4DB78Bd16F84F540", ["0x1f84DaF589C0b9Dea8c9a1B7463099e2DB2F589a"]))
    vaults.push(new VaultConfig("ramses-cl-rseth-ethx", PLATFORM_BEEFY_CLM, "0xBB18cb9D1F3f20dd1c3Af946b46Dd19872206DDa", ["0xf2bf40360aa066353f3b42576799141fe80e0285"]))
    vaults.push(new VaultConfig("ramses-cl-rseth-weth-vault", PLATFORM_BEEFY_CLM_VAULT, "0x45eAc6f86b974b0536Aa488eD8DDF3022F4C768E", ["0x338Fb7e54f4875c76cA77AA9653eB08e856e1FcD"]))
    vaults.push(new VaultConfig("ramses-cl-rseth-weth", PLATFORM_BEEFY_CLM, "0x9ebb94be20476db4a58e59c764e709b5fa35f8b0", ["0x81F15F4FA4848F7D87ceF27975AE2953bf333D7b"]))
    vaults.push(new VaultConfig("uniswap-cow-arb-ezeth-wsteth", PLATFORM_BEEFY_CLM, "0x83368b5e04d8a2c990ef9b5fe41509fafcfba499", ["0xe4c1fc47aDB25506E664Af9748a4c3ee98828318"]))
    vaults.push(new VaultConfig("uniswap-cow-arb-rseth-weth-vault", PLATFORM_BEEFY_CLM_VAULT, "0x1Db8d743824bdaBA39b88D22b44bcEcf7179D413", ["0x7f3e9f5EFFE06169Db679658392e4Ca79fd5E594"]))
    vaults.push(new VaultConfig("uniswap-cow-arb-rseth-weth", PLATFORM_BEEFY_CLM, "0xf3d5c975de1c0fd358a593bcef7a41c61366127c", ["0x04D463bf08dF252Cb09a87D6d41a33c535942710"]))
    vaults.push(new VaultConfig("uniswap-cow-arb-rseth-wsteth-vault", PLATFORM_BEEFY_CLM_VAULT, "0x86b81747ffd477907F8dF2DAF67A82314B94ae36", ["0x3Cfb81925e69650127b0cA3d9869027a94C01aC4"]))
    vaults.push(new VaultConfig("uniswap-cow-arb-rseth-wsteth", PLATFORM_BEEFY_CLM, "0x15cfBd3Db5D24360eeac802b3dde4423eb5C3C70", ["0x8B0345E218B84274154071614641a501821374A6"]))
    vaults.push(new VaultConfig("uniswap-cow-arb-usde-usdt-vault", PLATFORM_BEEFY_CLM_VAULT, "0xAEF840055a3441F61D8Ef2F7d53fCAf61b9e46E0", ["0x4Bf7b1Be5c10b4BdA826F0048Ad8bc44D7Bf2ca7"]))
    vaults.push(new VaultConfig("uniswap-cow-arb-usde-usdt", PLATFORM_BEEFY_CLM, "0xAf4c8cEE65Fd6dD1864f4bb53dbD386B0D092063", ["0xA48873601A35d7b5d778C6760fE1cbfb2FB3C030"]))
    vaults.push(new VaultConfig("uniswap-cow-arb-usde-wsteth", PLATFORM_BEEFY_CLM, "0x3786676C03B9518fad1724B43eB28b2Baa36588f", ["0x86B79cd04ca903398311936c777B86dB6dA7b07a"]))
  }

  if (network === "base") {
    vaults.push(new VaultConfig("aerodrome-ezeth-weth-s", PLATFORM_SOLIDLY, "0x90A7de0E16CA4521B1E4C3dBBA4edAA2354aB81B"))
    vaults.push(new VaultConfig("aerodrome-ezeth-weth", PLATFORM_SOLIDLY, "0xAB7EeE0a368079D2fBfc83599eD0148a16d0Ea09"))
    vaults.push(new VaultConfig("aerodrome-usdz-susdz", PLATFORM_SOLIDLY, "0xd4F3e6FaD95Af2512462FeCe507be3C29FE7960C"))
    vaults.push(new VaultConfig("aerodrome-usdz-usdc", PLATFORM_SOLIDLY, "0x3b5F990364fa9BF1Db34d9d24B0Bdca6eE4bD4B1"))
    vaults.push(new VaultConfig("aerodrome-usdz-weth", PLATFORM_SOLIDLY, "0x04B3E65D4f8f722d7B0D2BA76075B1eAC33CE2AF"))
    vaults.push(new VaultConfig("aerodrome-weth-wrseth", PLATFORM_SOLIDLY, "0xC5cD1A6d4918820201B8E4eeB6d2AdFD1CDF783d"))
  }

  if (network === "mainnet") {
    vaults.push(new VaultConfig("aura-ezeth-eth", PLATFORM_BALANCER_AURA, "0x3E1c2C604f60ef142AADAA51aa864f8438f2aaC1"))
    vaults.push(new VaultConfig("aura-rseth-weth", PLATFORM_BALANCER_AURA, "0x967f88e651db83B1A74058D7499263eA7b3066E2"))
    vaults.push(new VaultConfig("aura-weeth-ezeth-rseth", PLATFORM_BALANCER_AURA, "0x5dA90BA82bED0AB701E6762D2bF44E08634d9776"))
    vaults.push(new VaultConfig("curve-veth", PLATFORM_CURVE, "0xAE0bFfc3110e69DA8993F11C1CBd9a6eA3d16daF", ["0x9Db900bFD1D13112dE2239418eb3D8673B6F1878"]))
    vaults.push(new VaultConfig("pendle-ageth-26dec24", PLATFORM_PENDLE_EQUILIBRIA, "0xc651F2e75101b247bdA18414Fcc23d00cd2c31e2"))
    vaults.push(new VaultConfig("pendle-rseth-26dec24", PLATFORM_PENDLE_EQUILIBRIA, "0x178799CF80C4E16D195f75ff82a9C53b216b08D6"))
    vaults.push(new VaultConfig("pendle-rsweth-26sep24", PLATFORM_PENDLE_EQUILIBRIA, "0x22b5f6692bAdaB196b4eEBfc1f9DA72D5Cc2af15"))
    vaults.push(new VaultConfig("pendle-unieth-26sep24", PLATFORM_PENDLE_EQUILIBRIA, "0x9A43381249a6417f8ce03CCF26139b5f05527e4F"))
  }

  if (network === "linea") {
    vaults.push(new VaultConfig("lynex-gamma-ezeth-weth", PLATFORM_GAMMA, "0x35884E8C569b9f7714A35EDf056A82535A43F5AD"))
    vaults.push(new VaultConfig("lynex-gamma-ineth-wsteth", PLATFORM_GAMMA, "0xAA3b8C08e7Fe86E1dda8FA9FE7423561Ad316e3F"))
    vaults.push(new VaultConfig("lynex-gamma-stone-weth", PLATFORM_GAMMA, "0x1C973f35325947f30F20fE1189605A332FD9F40F"))
    vaults.push(new VaultConfig("lynex-ichi-stone-lynx", PLATFORM_ICHI_LYNEX, "0x5AB215b3C42f97165Ab43e7FA7609cc8F8D68817"))
    vaults.push(new VaultConfig("lynex-stone-weth", PLATFORM_LYNEX, "0x1C8cfC0cFf01D59f2e4d6F547EE227Af869EfA07"))
    vaults.push(new VaultConfig("mendi-linea-ezeth", PLATFORM_AAVE, "0xf711cdcDDa1C5F919c94573cC4E38b4cE2207750"))
    vaults.push(new VaultConfig("mendi-linea-lev-usdc", PLATFORM_MENDI_LEVERAGE, "0x9ab545Ab024a8Da2302f5b0D016F4f5501e330d1"))
    vaults.push(new VaultConfig("mendi-linea-lev-usdt", PLATFORM_MENDI_LEVERAGE, "0xC3C757EA1429231C437736746Eb77A2344EAcb81"))
    vaults.push(new VaultConfig("mendi-linea-lev-wbtc", PLATFORM_MENDI_LEVERAGE, "0x639041dD8cD48B52C12414235d97E1313cbbceff"))
    vaults.push(new VaultConfig("mendi-linea-lev-weth", PLATFORM_MENDI_LEVERAGE, "0x23EC7f31a5c74D5Fe21aa386A7519028DBD6bA40"))
    vaults.push(new VaultConfig("mendi-linea-lev-wsteth", PLATFORM_MENDI_LEVERAGE, "0xBF71FbCe0d4Fc460D36fa1d13B397a3cd5c45220"))
    vaults.push(new VaultConfig("nile-cl-ezeth-weth-vault", PLATFORM_BEEFY_CLM_VAULT, "0xA0a2734F3947C8131603aAfE246A332be7A4AEc1"))
    vaults.push(new VaultConfig("nile-cl-ezeth-weth", PLATFORM_BEEFY_CLM, "0xD4CC44a7fBc0323d3d74565B558228feCc88A329", ["0xf98793D144392d3fd9c1c52660fB8DA97b46C1ae"]))
    vaults.push(new VaultConfig("nile-cl-rseth-weth-vault", PLATFORM_BEEFY_CLM_VAULT, "0x1Ea0a1a0D35f4A72156Aa19AC6322cfAA1f7DFd8"))
    vaults.push(new VaultConfig("nile-cl-rseth-weth", PLATFORM_BEEFY_CLM, "0x7c82356b425DaF36D447D24BAa6906eE15EBcf9A", ["0xEF0f0D10A93f5BDeF4aCEFaC02770eeC26302147"]))
    vaults.push(new VaultConfig("nile-ezeth-weth", PLATFORM_SOLIDLY, "0x063091e4532eD93CE93347C6c8338dcA0832ddb0"))
  }

  if (network === "optimism") {
    vaults.push(new VaultConfig("aura-op-weth-wrseth", PLATFORM_BALANCER_AURA, "0x2160BEDE9d5559bA559Eaf88052b46b8364eE245"))
    vaults.push(new VaultConfig("uniswap-cow-op-rseth-wsteth", PLATFORM_BEEFY_CLM, "0x0f46a74b01708e78c27def7160a5c5222f9dd157", ["0xF1748128a1b5c0c45728D09F6f1f60748bC03FE1"]))
    vaults.push(new VaultConfig("uniswap-cow-op-usde-wsteth", PLATFORM_BEEFY_CLM, "0x80D438EEdb918207c2F7F7eAC31f2F8012923F76", ["0x20eaD00Cf50Df696ddF434be900fA5a0a437181E"]))
    vaults.push(new VaultConfig("velo-cow-op-wsteth-ezeth-vault", PLATFORM_BEEFY_CLM_VAULT, "0x5578B44A1A8572b48160B67213A690FC2e75F298", ["0xB94b0ca6C316f65F0A5E46667CDA50B5EF1eA5F1"]))
    vaults.push(new VaultConfig("velo-cow-op-wsteth-ezeth", PLATFORM_BEEFY_CLM, "0x823f2B0aa1D54c38fe149ee119c6d7845e93593d", ["0x64831F82e3543006413897C03f59518CEcae02b4"]))
    vaults.push(new VaultConfig("velodrome-v2-weth-wrseth", PLATFORM_SOLIDLY, "0xDbE946E16c4e0De9a44065B868265Ac05c437fB6"))
  }

  if (network === "bsc") {
    //vaults.push(new VaultConfig("thena-gamma-weeth-eth-narrow", PLATFORM_GAMMA, "0xcCcDB0F6eCcd5f231d4737A00C554322167d814B"))
  }

  if (network === "kava") {
    vaults.push(new VaultConfig("kinetix-klp", TRACK_ONLY_SHARE_AND_UNDERLYING_TOKEN_BALANCE, "0x9a207D4D2ee8175995C69c0Fb1F117Bf7CcC93cd", ["0x7E4bEdE523726283BdF309d49087C3305e681cE0"]))
  }

  if (network === "manta-pacific-mainnet") {
    vaults.push(new VaultConfig("uniswap-cow-manta-weth-stone", PLATFORM_BEEFY_CLM, "0x906e60166a4b185016e53597fa12fbb1424e47d7", ["0x1386A611e2B692E79Bcfa7dC84AAbB5728f08E44"]))
  }

  if (network === "mode-mainnet") {
    vaults.push(new VaultConfig("velodrome-mode-ezeth-eth", PLATFORM_SOLIDLY, "0x94A3725124d2E71028Ee488b88566f1fb11A90C3"))
  }

  if (network === "sei") {
    vaults.push(new VaultConfig("yei-usdt", PLATFORM_AAVE, "0xcb25214EC41Ea480068638897FcBd6F1206F5521"))
    vaults.push(new VaultConfig("yei-usdc", PLATFORM_AAVE, "0x906e60166A4B185016e53597fA12FBB1424e47d7"))
    vaults.push(new VaultConfig("yei-wsei", PLATFORM_AAVE, "0x9E6B9518978bb7caf2ad70778E9AEED9eDb3DB78"))
  }

  return vaults
}

export class VaultConfig {
  public vaultKey: string
  public underlyingPlatform: string
  public address: string
  public boostAddresses: Array<string>
  public rewardPoolsAddresses: Array<string>

  constructor(vaultKey: string, underlyingPlatform: string, vault: string, boostsOrRewardPools: Array<string> = []) {
    this.vaultKey = vaultKey
    this.underlyingPlatform = underlyingPlatform
    this.address = vault
    this.boostAddresses = new Array<string>()
    this.rewardPoolsAddresses = new Array<string>()

    if (underlyingPlatform === PLATFORM_BEEFY_CLM || underlyingPlatform === PLATFORM_BEEFY_CLM_VAULT) {
      for (let i = 0; i < boostsOrRewardPools.length; i++) {
        this.rewardPoolsAddresses.push(boostsOrRewardPools[i])
      }
    } else {
      for (let i = 0; i < boostsOrRewardPools.length; i++) {
        this.boostAddresses.push(boostsOrRewardPools[i])
      }
    }
  }
}
