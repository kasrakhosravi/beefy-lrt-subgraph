import { log } from "@graphprotocol/graph-ts"
import { BeefyVault } from "../../generated/schema"
import {
  PLATFORM_AAVE,
  PLATFORM_BALANCER_AURA,
  PLATFORM_CURVE,
  PLATFORM_GAMMA,
  PLATFORM_ICHI_LYNEX,
  PLATFORM_LYNEX,
  PLATFORM_MENDI_LENDING,
  PLATFORM_MENDI_LEVERAGE,
  PLATFORM_NILE,
  PLATFORM_PENDLE_EQUILIBRIA,
  PLATFORM_SOLIDLY,
} from "../vault-config"
import { TokenBalance } from "./common"
import { getVaultTokenBreakdownPendle } from "./pendle"
import { getVaultTokenBreakdownBalancer } from "./balancer"
import { getVaultTokenBreakdownCurve } from "./curve"
import { getVaultTokenBreakdownSolidly } from "./solidly"
import { getVaultTokenBreakdownAave } from "./aave"
import { getVaultTokenBreakdownGamma } from "./gamma"
import { getVaultTokenBreakdownIchiLynex } from "./ichi"
import { getVaultTokenBreakdownLynex } from "./lynex"
import { getVaultTokenBreakdownNile } from "./nile"
import { getVaultTokenBreakdownMendiLending } from "./mendi"

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
  } else if (vault.underlyingPlatform == PLATFORM_ICHI_LYNEX) {
    return getVaultTokenBreakdownIchiLynex(vault)
  } else if (vault.underlyingPlatform == PLATFORM_LYNEX) {
    return getVaultTokenBreakdownLynex(vault)
  } else if (vault.underlyingPlatform == PLATFORM_NILE) {
    return getVaultTokenBreakdownNile(vault)
  } else if (vault.underlyingPlatform == PLATFORM_MENDI_LENDING) {
    return getVaultTokenBreakdownMendiLending(vault)
  } else if (vault.underlyingPlatform == PLATFORM_MENDI_LEVERAGE) {
    return getVaultTokenBreakdownMendiLending(vault)
  }

  log.error("Not implemented platform {} for vault {}", [vault.underlyingPlatform, vault.id.toHexString()])
  throw new Error("Not implemented platform")
}
