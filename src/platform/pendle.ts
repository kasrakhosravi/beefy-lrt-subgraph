import { BeefyVault } from "../../generated/schema"
import { TokenBalance } from "./common"
import { PendleMarket as PendleMarketContract } from "../../generated/templates/BeefyVaultV7/PendleMarket"
import { PendleSyToken as PendleSyTokenContract } from "../../generated/templates/BeefyVaultV7/PendleSyToken"
import { Address } from "@graphprotocol/graph-ts"

export function getVaultTokenBreakdownPendle(vault: BeefyVault): Array<TokenBalance> {
  let balances = new Array<TokenBalance>()

  const wantTotalBalance = vault.rawUnderlyingBalance
  const pendleMarketContract = PendleMarketContract.bind(vault.underlyingToken)
  const tokenAddresses = pendleMarketContract.readTokens()
  const pendleState = pendleMarketContract.readState(getRouterAddress())

  const syAddress = tokenAddresses.value0
  const totalSy = pendleState.totalSy
  const pendleTotalSupply = pendleState.totalLp

  const syTokenContract = PendleSyTokenContract.bind(syAddress)
  const syUnderlyingAddress = syTokenContract.yieldToken()

  balances.push(new TokenBalance(syUnderlyingAddress, totalSy.times(wantTotalBalance).div(pendleTotalSupply)))

  return balances
}

// might change in the future based on the network
function getRouterAddress(): Address {
  return Address.fromString("0x00000000005BBB0EF59571E58418F9a4357b68A0")
}
