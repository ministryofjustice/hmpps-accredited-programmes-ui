import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import { referralStatuses } from '../../@types/models/Referral'
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

const randomStatus = (availableStatuses?: Array<ReferralStatus>) =>
  faker.helpers.arrayElement(availableStatuses || referralStatuses)

const statusDescriptionAndColour = (status: ReferralStatus): Pick<Referral, 'statusColour' | 'statusDescription'> => {
  switch (status) {
    case 'awaiting_assessment':
      return { statusColour: 'light-blue', statusDescription: 'Awaiting Assessment' }
    case 'on_hold_awaiting_assessment':
      return { statusColour: 'light-blue', statusDescription: 'On Hold - Awaiting Assessment' }
    case 'assessment_started':
      return { statusColour: 'blue', statusDescription: 'Assessment started' }
    case 'referral_started':
      return { statusColour: 'yellow', statusDescription: 'Referral started' }
    case 'referral_submitted':
      return { statusColour: 'green', statusDescription: 'Referral submitted' }
    case 'on_programme':
      return { statusColour: 'pink', statusDescription: 'On Programme' }
    case 'withdrawn':
      return { statusColour: 'grey', statusDescription: 'Withdrawn' }
    case 'assessed_suitable':
      return { statusColour: 'purple', statusDescription: 'Assessed as Suitable' }
    case 'suitable_not_ready':
      return { statusColour: 'yellow', statusDescription: 'Suitable but not ready' }
    case 'programme_complete':
      return { statusColour: 'grey', statusDescription: 'Programme complete' }
    case 'deselected':
      return { statusColour: 'grey', statusDescription: 'Deselected' }
    case 'not_suitable':
      return { statusColour: 'grey', statusDescription: 'Not suitable' }
    default:
      return { statusColour: undefined, statusDescription: undefined }
  }
}

export default ReferralFactory.define(({ params }) => {
  const status = params.status || randomStatus()

  return {
    id: faker.string.uuid(), // eslint-disable-next-line sort-keys
    additionalInformation: faker.lorem.paragraph({ max: 5, min: 0 }),
    hasReviewedProgrammeHistory: faker.datatype.boolean(),
    oasysConfirmed: faker.datatype.boolean(),
    offeringId: faker.string.uuid(),
    prisonNumber: faker.string.alphanumeric({ length: 7 }),
    referrerUsername: faker.internet.userName(),
    status,
    submittedOn: status !== 'referral_started' ? faker.date.past().toISOString() : undefined,
    ...statusDescriptionAndColour(status),
  }
})

export { randomStatus, statusDescriptionAndColour }
