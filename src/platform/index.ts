import { log } from "@graphprotocol/graph-ts"
import { BeefyVault } from "../../generated/schema"
import { PLATFORM_SOLIDLY, PLATFORM_BALANCER_AURA, PLATFORM_CURVE, PLATFORM_GAMMA, PLATFORM_AAVE, PLATFORM_PENDLE_EQUILIBRIA, PLATFORM_MENDI_LEVERAGE } from "../vault-config"
import { TokenBalance } from "./common"
import { getVaultTokenBreakdownPendle } from "./pendle"
import { getVaultTokenBreakdownBalancer } from "./balancer"
import { getVaultTokenBreakdownCurve } from "./curve"
import { getVaultTokenBreakdownSolidly } from "./solidly"
import { getVaultTokenBreakdownAave } from "./aave"
import { getVaultTokenBreakdownGamma } from "./gamma"

export function getVaultTokenBreakdown(vault: BeefyVault): Array<TokenBalance> {
  if (vault.underlyingPlatform == PLATFORM_PENDLE_EQUILIBRIA) {
    return getVaultTokenBreakdownPendle(vault)
  } else if (vault.underlyingPlatform == PLATFORM_BALANCER_AURA) {
    return getVaultTokenBreakdownBalancer(vault)
  } else if (vault.underlyingPlatform == PLATFORM_CURVE) {
    return getVaultTokenBreakdownCurve(vault)
  } else if (vault.underlyingPlatform == PLATFORM_SOLIDLY) {
    return getVaultTokenBreakdownSolidly(vault)
  } else if (vault.underlyingPlatform == PLATFORM_AAVE) {
    return getVaultTokenBreakdownAave(vault)
  } else if (vault.underlyingPlatform == PLATFORM_GAMMA) {
    return getVaultTokenBreakdownGamma(vault)
  } else if (vault.underlyingPlatform == PLATFORM_MENDI_LEVERAGE) {
    // we don't need the break down for mendi leverage atm
    // we only care about the moo token time weighted balance
    return new Array<TokenBalance>()
  }

  log.error("Not implemented platform {} for vault {}", [vault.underlyingPlatform, vault.id.toHexString()])
  throw new Error("Not implemented platform")
}
