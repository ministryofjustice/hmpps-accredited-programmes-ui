import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { OffenceDetail } from '@accredited-programmes/models'

export default Factory.define<OffenceDetail>(() => {
  return {
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
    victimWasStranger: faker.datatype.boolean(),
  }
})
