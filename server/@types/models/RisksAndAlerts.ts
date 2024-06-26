interface Alert {
  alertType: string
  dateCreated: string
  description: string
}

type RiskLevel = 'HIGH' | 'LOW' | 'MEDIUM' | 'VERY_HIGH'

type RisksAndAlerts = {
  alerts?: Array<Alert>
  imminentRiskOfViolenceTowardsOthers?: RiskLevel
  imminentRiskOfViolenceTowardsPartner?: RiskLevel
  ogrsRisk?: RiskLevel
  ogrsYear1?: number
  ogrsYear2?: number
  ospcScore?: RiskLevel
  ospiScore?: RiskLevel
  overallRoshLevel?: RiskLevel
  ovpRisk?: RiskLevel
  ovpYear1?: number
  ovpYear2?: number
  riskChildrenCommunity?: RiskLevel
  riskChildrenCustody?: RiskLevel
  riskKnownAdultCommunity?: RiskLevel
  riskKnownAdultCustody?: RiskLevel
  riskPrisonersCustody?: RiskLevel
  riskPublicCommunity?: RiskLevel
  riskPublicCustody?: RiskLevel
  riskStaffCommunity?: RiskLevel
  riskStaffCustody?: RiskLevel
  rsrRisk?: RiskLevel
  rsrScore?: number
}

export type { Alert, RiskLevel, RisksAndAlerts }
