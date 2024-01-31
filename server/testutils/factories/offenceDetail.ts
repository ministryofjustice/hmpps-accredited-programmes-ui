import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import FactoryHelpers from './factoryHelpers'
import type { OffenceDetail } from '@accredited-programmes/api'

class OffenceDetailFactory extends Factory<OffenceDetail> {
  withAllOptionalFields() {
    return this.params({
      acceptsResponsibility: faker.datatype.boolean(),
      acceptsResponsibilityDetail: faker.lorem.sentence(),
      contactTargeting: faker.datatype.boolean(),
      domesticViolence: faker.datatype.boolean(),
      motivationAndTriggers: faker.lorem.sentence(),
      numberOfOthersInvolved: faker.number.int(),
      offenceDetails: faker.lorem.sentence(),
      othersInvolvedDetail: faker.lorem.sentence(),
      patternOffending: faker.lorem.sentence(),
      peerGroupInfluences: faker.lorem.sentence(),
      raciallyMotivated: faker.datatype.boolean(),
      recognisesImpact: faker.datatype.boolean(),
      repeatVictimisation: faker.datatype.boolean(),
      revenge: faker.datatype.boolean(),
      stalking: faker.datatype.boolean(),
    })
  }
}

export default OffenceDetailFactory.define(
  (): OffenceDetail => ({
    acceptsResponsibility: FactoryHelpers.optionalArrayElement(faker.datatype.boolean()),
    acceptsResponsibilityDetail: FactoryHelpers.optionalArrayElement(faker.lorem.sentence()),
    contactTargeting: FactoryHelpers.optionalArrayElement(faker.datatype.boolean()),
    domesticViolence: FactoryHelpers.optionalArrayElement(faker.datatype.boolean()),
    motivationAndTriggers: FactoryHelpers.optionalArrayElement(faker.lorem.sentence()),
    numberOfOthersInvolved: FactoryHelpers.optionalArrayElement(faker.number.int()),
    offenceDetails: FactoryHelpers.optionalArrayElement(faker.lorem.sentence()),
    othersInvolvedDetail: FactoryHelpers.optionalArrayElement(faker.lorem.sentence()),
    patternOffending: FactoryHelpers.optionalArrayElement(faker.lorem.sentence()),
    peerGroupInfluences: FactoryHelpers.optionalArrayElement(faker.lorem.sentence()),
    raciallyMotivated: FactoryHelpers.optionalArrayElement(faker.datatype.boolean()),
    recognisesImpact: FactoryHelpers.optionalArrayElement(faker.datatype.boolean()),
    repeatVictimisation: FactoryHelpers.optionalArrayElement(faker.datatype.boolean()),
    revenge: FactoryHelpers.optionalArrayElement(faker.datatype.boolean()),
    stalking: FactoryHelpers.optionalArrayElement(faker.datatype.boolean()),
  }),
)
