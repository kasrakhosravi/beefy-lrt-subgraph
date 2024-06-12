import { BeefyVault } from "../../generated/schema"
import { TokenBalance } from "./common"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { BeefyVaultV7 as BeefyVaultV7Contract } from "../../generated/templates/BeefyVaultV7/BeefyVaultV7"
import { CurveToken as CurveTokenContract } from "../../generated/templates/BeefyVaultV7/CurveToken"
import { CurvePool as CurvePoolContract } from "../../generated/templates/BeefyVaultV7/CurvePool"

/**
 * @dev This breaks when the lp token and lp pool are different
 * @dev Does not break down meta pools
 * TODO try to find an on-chain way to get the lp pool (as vault only provides the lp token)
 * TODO try to break down meta pools (where one token of the pool is another pool)
 */
export function getVaultTokenBreakdownCurve(vault: BeefyVault): Array<TokenBalance> {
  let balances = new Array<TokenBalance>()

  const vaultContract = BeefyVaultV7Contract.bind(Address.fromBytes(vault.sharesToken))
  const wantTotalBalance = vaultContract.balance()

  const underlyingTokenAddress = Address.fromBytes(vault.underlyingToken)

  // fetch on chain data
  const curveTokenContract = CurveTokenContract.bind(underlyingTokenAddress)
  const totalSupply = curveTokenContract.totalSupply()

  // Some pools have N_COINS but some don't, so we have to resort to trying until we get a revert
  const curvePoolContract = CurvePoolContract.bind(underlyingTokenAddress)
  const coins = new Array<Address>()
  coins.push(curvePoolContract.coins(BigInt.zero()))
  coins.push(curvePoolContract.coins(BigInt.fromI32(1))) // always at least 2 coins
  for (let i = 2; i < 8; ++i) {
    const nextCoin = curvePoolContract.try_coins(BigInt.fromI32(i))
    if (nextCoin.reverted) {
      break
    }
    coins.push(nextCoin.value)
  }

  // Some pools have get_balances() but some don't, so we have to resort to looping
  const reserves = new Array<BigInt>()
  for (let i = 0; i < coins.length; ++i) {
    reserves.push(curvePoolContract.balances(BigInt.fromI32(i)))
  }

  for (let i = 0; i < coins.length; ++i) {
    balances.push(new TokenBalance(coins[i], reserves[i].times(wantTotalBalance).div(totalSupply)))
  }

  return balances
}
