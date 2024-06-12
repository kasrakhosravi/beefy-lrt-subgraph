import { Bytes } from "@graphprotocol/graph-ts"
import { BeefyVault, Investor, InvestorPosition } from "../../generated/schema"
import { ZERO_BD, ZERO_BI } from "../utils/decimal"

// @ts-ignore
@inline
export function getInvestorPositionId(vault: BeefyVault, investor: Investor): Bytes {
  return vault.id.concat(investor.id)
}

export function isNewInvestorPosition(position: InvestorPosition): boolean {
  return position.sharesBalance.equals(ZERO_BD)
}

export function getInvestorPosition(vault: BeefyVault, investor: Investor): InvestorPosition {
  let id = getInvestorPositionId(vault, investor)
  let position = InvestorPosition.load(id)
  if (!position) {
    position = new InvestorPosition(id)
    position.vault = vault.id
    position.investor = investor.id
    position.rawSharesBalance = ZERO_BI
    position.sharesBalance = ZERO_BD
  }
  return position
}
