import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { Referral, ReferralStatus } from '@accredited-programmes/models'

class ReferralFactory extends Factory<Referral> {
  started() {
    return this.params({
      additionalInformation: undefined,
      hasReviewedProgrammeHistory: false,
      oasysConfirmed: false,
      status: 'referral_started',
      submittedOn: undefined,
    })
  }

  submittable() {
    return this.params({
      additionalInformation: faker.lorem.paragraph({ max: 5, min: 1 }),
      hasReviewedProgrammeHistory: true,
      oasysConfirmed: true,
      status: 'referral_started',
      submittedOn: undefined,
    })
  }

  submitted() {
    return this.params({
      additionalInformation: faker.lorem.paragraph({ max: 5, min: 1 }),
      hasReviewedProgrammeHistory: true,
      oasysConfirmed: true,
      status: 'referral_submitted',
      submittedOn: faker.date.past().toISOString(),
    })
  }
}

export const status = faker.helpers.arrayElement([
  'awaiting_assessment',
  'assessment_started',
  'referral_started',
  'referral_submitted',
]) as ReferralStatus

export default ReferralFactory.define(({ params }) => ({
  id: faker.string.uuid(), // eslint-disable-next-line sort-keys
  additionalInformation: faker.lorem.paragraph({ max: 5, min: 0 }),
  hasReviewedProgrammeHistory: faker.datatype.boolean(),
  oasysConfirmed: faker.datatype.boolean(),
  offeringId: faker.string.uuid(),
  prisonNumber: faker.string.alphanumeric({ length: 7 }),
  referrerId: faker.string.numeric({ length: 6 }),
  status,
  submittedOn: (params.status || status) !== 'referral_started' ? faker.date.past().toISOString() : undefined,
}))
