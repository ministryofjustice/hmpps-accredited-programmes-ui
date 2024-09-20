import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import FactoryHelpers from './factoryHelpers'
import { randomStatus, statusDescriptionAndColour } from './referral'
import { referralStatuses } from '../../@types/models/Referral'
import type { ReferralStatusHistory } from '@accredited-programmes-api'

class ReferralStatusHistoryFactory extends Factory<ReferralStatusHistory> {
  started() {
    return this.params({ notes: undefined, previousStatus: undefined, status: 'referral_started' })
  }

  submitted() {
    return this.params({ notes: undefined, previousStatus: 'referral_started', status: 'referral_submitted' })
  }

  updated() {
    return this.params({
      notes: 'Some notes',
      previousStatus: 'referral_submitted',
      status: randomStatus(
        referralStatuses.filter(status => !['referral_started', 'referral_submitted'].includes(status)),
      ),
    })
  }
}

export default ReferralStatusHistoryFactory.define(({ params }) => {
  const previousStatus = Object.prototype.hasOwnProperty.call(params, 'previousStatus')
    ? params.previousStatus
    : randomStatus()
  const previousStatusColourAndDescription = statusDescriptionAndColour(previousStatus)

  const availableStatusesExcludingPreviousStatus = referralStatuses.filter(status => status !== previousStatus)

  const currentStatus = params.status || randomStatus(availableStatusesExcludingPreviousStatus)
  const currentStatusDescriptionAndColour = statusDescriptionAndColour(currentStatus)

  return {
    id: faker.string.uuid(), // eslint-disable-next-line sort-keys
    categoryDescription: FactoryHelpers.optionalArrayElement(faker.word.words({ count: { max: 3, min: 1 } })),
    notes: faker.lorem.paragraph({ max: 5, min: 0 }),
    previousStatus,
    previousStatusColour: previousStatusColourAndDescription.statusColour,
    previousStatusDescription: previousStatusColourAndDescription.statusDescription,
    reasonDescription: FactoryHelpers.optionalArrayElement(faker.word.words({ count: { max: 3, min: 1 } })),
    referralId: faker.internet.userName(),
    status: currentStatus,
    statusColour: currentStatusDescriptionAndColour.statusColour,
    statusDescription: currentStatusDescriptionAndColour.statusDescription,
    statusStartDate: faker.date.past().toISOString(),
    username: faker.internet.userName(),
  }
})
