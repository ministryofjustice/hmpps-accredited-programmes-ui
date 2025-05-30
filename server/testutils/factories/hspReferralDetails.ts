import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import sexualOffenceDetailsFactory from './sexualOffenceDetails'
import type { HspReferralDetails } from '@accredited-programmes-api'

export default Factory.define<HspReferralDetails>(() => {
  return {
    eligibilityOverrideReason: faker.lorem.sentence(),
    prisonNumber: faker.string.alphanumeric({ length: 7 }),
    selectedOffences: sexualOffenceDetailsFactory.buildList(3),
  }
})
