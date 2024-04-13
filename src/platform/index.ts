import { log } from "@graphprotocol/graph-ts"
import { BeefyVault } from "../../generated/schema"
import { PLATFORM_BALANCER_AURA, PLATFORM_CURVE, PLATFORM_PENDLE_EQUILIBRIA } from "../vault-config"
import { TokenBalance } from "./common"
import { getVaultTokenBreakdownPendle } from "./pendle"
import { getVaultTokenBreakdownBalancer } from "./balancer"
import { getVaultTokenBreakdownCurve } from "./curve"

export function getVaultTokenBreakdown(vault: BeefyVault): Array<TokenBalance> {
  if (vault.underlyingPlatform == PLATFORM_PENDLE_EQUILIBRIA) {
    return getVaultTokenBreakdownPendle(vault)
  } else if (vault.underlyingPlatform == PLATFORM_BALANCER_AURA) {
    return getVaultTokenBreakdownBalancer(vault)
  } else if (vault.underlyingPlatform == PLATFORM_CURVE) {
    return getVaultTokenBreakdownCurve(vault)
  }

  log.error("Not implemented platform {} for vault {}", [vault.underlyingPlatform, vault.id.toHexString()])
  throw new Error("Not implemented platform")
}
