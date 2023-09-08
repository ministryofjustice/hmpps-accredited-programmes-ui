import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { Referral } from '@accredited-programmes/models'

export default Factory.define<Referral>(() => ({
  id: faker.string.uuid(), // eslint-disable-next-line sort-keys
  oasysConfirmed: false,
  offeringId: faker.string.uuid(),
  prisonNumber: faker.string.alphanumeric({ length: 7 }),
  referrerId: faker.string.numeric({ length: 6 }),
  status: faker.helpers.arrayElement([
    'awaiting_assesment',
    'assessment_started',
    'referral_started',
    'referral_submitted',
  ]),
}))
