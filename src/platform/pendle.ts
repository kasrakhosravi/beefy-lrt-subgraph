import { BeefyVault } from "../../generated/schema"
import { TokenBalance } from "./common"
import { PendleMarket as PendleMarketContract } from "../../generated/templates/BeefyVaultV7/PendleMarket"
import { PendleSyToken as PendleSyTokenContract } from "../../generated/templates/BeefyVaultV7/PendleSyToken"
import { Address } from "@graphprotocol/graph-ts"
import { getTokenAndInitIfNeeded } from "../entity/token"

const PENDLE_ROUTER_ADDRESS = Address.fromString("0x00000000005BBB0EF59571E58418F9a4357b68A0")

export function getVaultTokenBreakdownPendle(vault: BeefyVault): Array<TokenBalance> {
  let balances = new Array<TokenBalance>()

  const wantTotalBalance = vault.rawUnderlyingBalance
  const underlyingToken = getTokenAndInitIfNeeded(vault.underlyingToken)

  // fetch on chain data
  const pendleMarketContract = PendleMarketContract.bind(Address.fromBytes(underlyingToken.id))
  const tokenAddresses = pendleMarketContract.readTokens()
  const pendleState = pendleMarketContract.readState(PENDLE_ROUTER_ADDRESS)
  const syTokenContract = PendleSyTokenContract.bind(tokenAddresses.value0)
  const syUnderlyingAddress = syTokenContract.yieldToken()

  // compute breakdown
  balances.push(new TokenBalance(syUnderlyingAddress, pendleState.totalSy.times(wantTotalBalance).div(pendleState.totalLp)))

  return balances
}
