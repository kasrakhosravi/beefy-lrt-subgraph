import { BeefyVault, Token, VaultBalanceBreakdownUpdateEvent, VaultBalanceBreakdown, InvestorPositionBalanceBreakdown, InvestorPosition } from "../../generated/schema"
import { ZERO_BD, ZERO_BI } from "../utils/decimal"
import { Bytes, ethereum } from "@graphprotocol/graph-ts"

export function getVaultBalanceBreakdown(vault: BeefyVault, token: Token): VaultBalanceBreakdown {
  let id = vault.id.concat(token.id)
  let breakdown = VaultBalanceBreakdown.load(id)
  if (!breakdown) {
    breakdown = new VaultBalanceBreakdown(id)
    breakdown.vault = vault.id
    breakdown.token = token.id
    breakdown.rawBalance = ZERO_BI
    breakdown.balance = ZERO_BD
    breakdown.lastUpdateTimestamp = ZERO_BI
    breakdown.lastUpdateBlock = ZERO_BI
  }
  return breakdown
}

export function saveVaultBalanceBreakdownUpdateEvent(vault: BeefyVault, block: ethereum.Block): void {
  const id = vault.id.concat(Bytes.fromByteArray(Bytes.fromBigInt(block.number)))
  let event = VaultBalanceBreakdownUpdateEvent.load(id)
  if (!event) {
    let event = new VaultBalanceBreakdownUpdateEvent(id)
    event.vault = vault.id
    event.blockNumber = block.number
    event.blockTimestamp = block.timestamp
    event.save()
  }
}

export function getInvestorPositionBalanceBreakdown(investorPosition: InvestorPosition, token: Token): InvestorPositionBalanceBreakdown {
  let id = investorPosition.id.concat(token.id)
  let breakdown = InvestorPositionBalanceBreakdown.load(id)
  if (!breakdown) {
    breakdown = new InvestorPositionBalanceBreakdown(id)
    breakdown.investorPosition = investorPosition.id
    breakdown.token = token.id
    breakdown.rawBalance = ZERO_BI
    breakdown.balance = ZERO_BD
    breakdown.rawTimeWeightedBalance = ZERO_BI
    breakdown.timeWeightedBalance = ZERO_BD
    breakdown.lastUpdateTimestamp = ZERO_BI
    breakdown.lastUpdateBlock = ZERO_BI
  }
  return breakdown
}
