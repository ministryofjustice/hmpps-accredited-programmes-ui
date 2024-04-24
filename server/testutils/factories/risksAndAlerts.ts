import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import FactoryHelpers from './factoryHelpers'
import type { RiskLevel, RisksAndAlerts } from '@accredited-programmes/models'

const alert = (): { description: string } => ({ description: faker.lorem.sentence() })
const riskLevel = () => faker.helpers.arrayElement<RiskLevel>(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'])
const percentage = () => faker.number.int({ max: 100, min: 0 })

class RiskAndAlertsFactory extends Factory<RisksAndAlerts> {
  withAllOptionalFields() {
    return this.params({
      alerts: Array(faker.helpers.rangeToNumber({ max: 10, min: 0 }))
        .fill(undefined)
        .map(_element => alert()),
      imminentRiskOfViolenceTowardsOthers: riskLevel(),
      imminentRiskOfViolenceTowardsPartner: riskLevel(),
      ogrsRisk: riskLevel(),
      ogrsYear1: percentage(),
      ogrsYear2: percentage(),
      ospcScore: riskLevel(),
      ospiScore: riskLevel(),
      overallRoshLevel: riskLevel(),
      ovpRisk: riskLevel(),
      ovpYear1: percentage(),
      ovpYear2: percentage(),
      riskChildrenCommunity: riskLevel(),
      riskChildrenCustody: riskLevel(),
      riskKnownAdultCommunity: riskLevel(),
      riskKnownAdultCustody: riskLevel(),
      riskPrisonersCustody: riskLevel(),
      riskPublicCommunity: riskLevel(),
      riskPublicCustody: riskLevel(),
      riskStaffCommunity: riskLevel(),
      riskStaffCustody: riskLevel(),
      rsrRisk: riskLevel(),
      rsrScore: faker.number.float({ max: 100, min: 0, multipleOf: 0.01 }),
    })
  }
}

export default RiskAndAlertsFactory.define(
  (): RisksAndAlerts => ({
    alerts: FactoryHelpers.optionalArrayElement([
      Array(faker.helpers.rangeToNumber({ max: 10, min: 0 }))
        .fill(undefined)
        .map(_element => alert()),
    ]),
    imminentRiskOfViolenceTowardsOthers: FactoryHelpers.optionalArrayElement(riskLevel()),
    imminentRiskOfViolenceTowardsPartner: FactoryHelpers.optionalArrayElement(riskLevel()),
    ogrsRisk: FactoryHelpers.optionalArrayElement(riskLevel()),
    ogrsYear1: FactoryHelpers.optionalArrayElement(percentage()),
    ogrsYear2: FactoryHelpers.optionalArrayElement(percentage()),
    ospcScore: FactoryHelpers.optionalArrayElement(riskLevel()),
    ospiScore: FactoryHelpers.optionalArrayElement(riskLevel()),
    overallRoshLevel: FactoryHelpers.optionalArrayElement(riskLevel()),
    ovpRisk: FactoryHelpers.optionalArrayElement(riskLevel()),
    ovpYear1: FactoryHelpers.optionalArrayElement(percentage()),
    ovpYear2: FactoryHelpers.optionalArrayElement(percentage()),
    riskChildrenCommunity: FactoryHelpers.optionalArrayElement(riskLevel()),
    riskChildrenCustody: FactoryHelpers.optionalArrayElement(riskLevel()),
    riskKnownAdultCommunity: FactoryHelpers.optionalArrayElement(riskLevel()),
    riskKnownAdultCustody: FactoryHelpers.optionalArrayElement(riskLevel()),
    riskPrisonersCustody: FactoryHelpers.optionalArrayElement(riskLevel()),
    riskPublicCommunity: FactoryHelpers.optionalArrayElement(riskLevel()),
    riskPublicCustody: FactoryHelpers.optionalArrayElement(riskLevel()),
    riskStaffCommunity: FactoryHelpers.optionalArrayElement(riskLevel()),
    riskStaffCustody: FactoryHelpers.optionalArrayElement(riskLevel()),
    rsrRisk: FactoryHelpers.optionalArrayElement(riskLevel()),
    rsrScore: FactoryHelpers.optionalArrayElement(faker.number.float({ max: 100, min: 0, multipleOf: 0.01 })),
  }),
)
