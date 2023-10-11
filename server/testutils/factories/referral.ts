import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { Referral, ReferralStatus } from '@accredited-programmes/models'

class ReferralFactory extends Factory<Referral> {
  started() {
    return this.params({
      hasReviewedProgrammeHistory: false,
      oasysConfirmed: false,
      reason: undefined,
      status: 'referral_started',
    })
  }

  submittable() {
    return this.params({
      hasReviewedProgrammeHistory: true,
      oasysConfirmed: true,
      reason: faker.lorem.paragraph({ max: 5, min: 1 }),
      status: 'referral_started',
    })
  }

  submitted() {
    return this.params({
      hasReviewedProgrammeHistory: true,
      oasysConfirmed: true,
      reason: faker.lorem.paragraph({ max: 5, min: 1 }),
      status: 'referral_submitted',
    })
  }
}

export default ReferralFactory.define(() => ({
  id: faker.string.uuid(), // eslint-disable-next-line sort-keys
  hasReviewedProgrammeHistory: faker.datatype.boolean(),
  oasysConfirmed: faker.datatype.boolean(),
  offeringId: faker.string.uuid(),
  prisonNumber: faker.string.alphanumeric({ length: 7 }),
  reason: faker.lorem.paragraph({ max: 5, min: 0 }),
  referrerId: faker.string.numeric({ length: 6 }),
  status: faker.helpers.arrayElement([
    'awaiting_assesment',
    'assessment_started',
    'referral_started',
    'referral_submitted',
  ]) as ReferralStatus,
}))
