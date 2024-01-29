import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import courseAudienceFactory from './courseAudience'
import FactoryHelpers from './factoryHelpers'
import { randomStatus } from './referral'
import { StringUtils } from '../../utils'
import type { ReferralStatus, ReferralSummary } from '@accredited-programmes/models'

interface ReferralSummaryTransientParams {
  availableStatuses: Array<ReferralStatus>
  requireOptionalFields?: boolean
}

class ReferralSummaryFactory extends Factory<ReferralSummary, ReferralSummaryTransientParams> {
  withAllOptionalFields() {
    return this.transient({ requireOptionalFields: true })
  }
}

export default ReferralSummaryFactory.define(({ params, transientParams }) => {
  const { availableStatuses, requireOptionalFields } = transientParams

  const conditionalReleaseDate = requireOptionalFields
    ? FactoryHelpers.randomFutureDateString()
    : FactoryHelpers.optionalRandomFutureDateString()
  const paroleEligibilityDate = requireOptionalFields
    ? FactoryHelpers.randomFutureDateString()
    : FactoryHelpers.optionalRandomFutureDateString()
  const tariffExpiryDate = requireOptionalFields
    ? FactoryHelpers.randomFutureDateString()
    : FactoryHelpers.optionalRandomFutureDateString()
  const indeterminateSentence = requireOptionalFields
    ? faker.datatype.boolean()
    : FactoryHelpers.optionalArrayElement(faker.datatype.boolean())

  let { prisonName, sentence, tasksCompleted } = params

  if (requireOptionalFields || !Object.prototype.hasOwnProperty.call(params, 'sentence')) {
    sentence ||= {
      conditionalReleaseDate,
      indeterminateSentence,
      nonDtoReleaseDateType: FactoryHelpers.optionalArrayElement(['ARD', 'CRD', 'NPD', 'PRRD']),
      paroleEligibilityDate,
      tariffExpiryDate,
    }
  }

  if (requireOptionalFields || !Object.prototype.hasOwnProperty.call(params, 'prisonName')) {
    prisonName ||= `${faker.location.county()} (HMP)`
  }

  if (requireOptionalFields || !Object.prototype.hasOwnProperty.call(params, 'tasksCompleted')) {
    tasksCompleted ||= faker.number.int({ max: 4, min: 1 })
  }

  let earliestReleaseDate: ReferralSummary['earliestReleaseDate']
  if (sentence) {
    earliestReleaseDate = sentence.indeterminateSentence
      ? sentence.tariffExpiryDate
      : sentence.paroleEligibilityDate || sentence.conditionalReleaseDate
  }

  const status = params.status || randomStatus(availableStatuses)

  return {
    id: faker.string.uuid(), // eslint-disable-next-line sort-keys
    audience: courseAudienceFactory.build(),
    courseName: `${StringUtils.convertToTitleCase(faker.color.human())} Course`,
    earliestReleaseDate,
    organisationId: faker.string.alpha({ casing: 'upper', length: 3 }),
    prisonName,
    prisonNumber: faker.string.alphanumeric({ length: 7 }),
    prisonerName: {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    },
    referrerUsername: faker.internet.userName(),
    sentence,
    status,
    submittedOn: status !== 'referral_started' ? faker.date.past().toISOString() : undefined,
    tasksCompleted,
  }
})
