import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import sexualOffenceDetailsFactory from './sexualOffenceDetails'
import type { HspReferralDetails } from '@accredited-programmes-api'

export default Factory.define<HspReferralDetails>(() => {
  return {
    eligibilityOverrideReason: Math.random() < 0.5 ? faker.lorem.sentence() : undefined,
    prisonNumber: faker.string.alphanumeric({ length: 7 }),
    selectedOffences: sexualOffenceDetailsFactory.buildList(3),
  }
})
