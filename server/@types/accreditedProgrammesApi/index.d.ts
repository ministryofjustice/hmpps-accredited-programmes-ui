import type { components } from './imported'

type schemas = components['schemas']

type Attitude = schemas['Attitude']
type Behaviour = schemas['Behaviour']
type Course = schemas['Course']
type CourseOffering = schemas['CourseOffering']
type CourseParticipation = schemas['CourseParticipation']
type CourseParticipationOutcome = schemas['CourseParticipationOutcome']
type CourseParticipationSetting = schemas['CourseParticipationSetting']
type CourseParticipationUpdate = schemas['CourseParticipationUpdate']
type CoursePrerequisite = schemas['CoursePrerequisite']
type Health = schemas['Health']
type LearningNeeds = schemas['LearningNeeds']
type Lifestyle = schemas['Lifestyle']
type OffenceDetail = schemas['OffenceDetail']
type PaginatedReferralSummary = schemas['PaginatedReferralSummary']
type Psychiatric = schemas['Psychiatric']
type Referral = schemas['Referral']
type ReferralCreated = schemas['ReferralCreated']
type ReferralStatus = schemas['ReferralStatus']
type ReferralSummary = schemas['ReferralSummary']
type ReferralUpdate = schemas['ReferralUpdate']
type Relationships = schemas['Relationships']
type Risks = schemas['Risks']
type RoshAnalysis = schemas['RoshAnalysis']

// this plugs a gap in the API: it might be better to tighten the API schema
// long term
type RiskLevel =
  | Risks['imminentRiskOfViolenceTowardsOthers']
  | Risks['imminentRiskOfViolenceTowardsPartner']
  | Risks['ogrsRisk']
  | Risks['ospcScore']
  | Risks['ospiScore']
  | Risks['overallRoshLevel']
  | Risks['ovpRisk']
  | Risks['riskChildrenCommunity']
  | Risks['riskChildrenCustody']
  | Risks['riskKnownAdultCommunity']
  | Risks['riskKnownAdultCustody']
  | Risks['riskPrisonersCustody']
  | Risks['riskPublicCommunity']
  | Risks['riskPublicCustody']
  | Risks['riskStaffCommunity']
  | Risks['riskStaffCustody']
  | Risks['rsrRisk']

export type {
  Attitude,
  Behaviour,
  Course,
  CourseOffering,
  CourseParticipation,
  CourseParticipationOutcome,
  CourseParticipationSetting,
  CourseParticipationUpdate,
  CoursePrerequisite,
  Health,
  LearningNeeds,
  Lifestyle,
  OffenceDetail,
  PaginatedReferralSummary,
  Psychiatric,
  Referral,
  ReferralCreated,
  ReferralStatus,
  ReferralSummary,
  ReferralUpdate,
  Relationships,
  RiskLevel,
  Risks,
  RoshAnalysis,
}
