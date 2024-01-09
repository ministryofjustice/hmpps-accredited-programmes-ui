import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import courseAudienceFactory from './courseAudience'
import FactoryHelpers from './factoryHelpers'
import { randomStatus } from './referral'
import { StringUtils } from '../../utils'
import type { ReferralStatus, ReferralSummary } from '@accredited-programmes/models'

interface ReferralSummaryTransientParams {
  availableStatuses: Array<ReferralStatus>
}

export default Factory.define<ReferralSummary, ReferralSummaryTransientParams>(({ params, transientParams }) => {
  const conditionalReleaseDate = FactoryHelpers.optionalRandomFutureDateString()
  const paroleEligibilityDate = FactoryHelpers.optionalRandomFutureDateString()
  const tariffExpiryDate = FactoryHelpers.optionalRandomFutureDateString()
  const indeterminateSentence = FactoryHelpers.optionalArrayElement(faker.datatype.boolean())

  const sentence: ReferralSummary['sentence'] = Object.prototype.hasOwnProperty.call(params, 'sentence')
    ? params.sentence
    : FactoryHelpers.optionalArrayElement({
        conditionalReleaseDate,
        indeterminateSentence,
        nonDtoReleaseDateType: FactoryHelpers.optionalArrayElement(['ARD', 'CRD', 'NPD', 'PRRD']),
        paroleEligibilityDate,
        tariffExpiryDate,
      })

  let earliestReleaseDate: ReferralSummary['earliestReleaseDate']
  if (sentence) {
    earliestReleaseDate = sentence.indeterminateSentence
      ? sentence.tariffExpiryDate
      : sentence.paroleEligibilityDate || sentence.conditionalReleaseDate
  }

  const { availableStatuses } = transientParams
  const status = params.status || randomStatus(availableStatuses)

  return {
    id: faker.string.uuid(), // eslint-disable-next-line sort-keys
    audiences: FactoryHelpers.buildListBetween(courseAudienceFactory, { max: 3, min: 1 }).map(
      audience => audience.value,
    ),
    courseName: `${StringUtils.convertToTitleCase(faker.color.human())} Course`,
    earliestReleaseDate,
    organisationId: faker.string.alpha({ casing: 'upper', length: 3 }),
    prisonName: Object.prototype.hasOwnProperty.call(params, 'prisonName')
      ? params.prisonName
      : `${faker.location.county()} (HMP)`,
    prisonNumber: faker.string.alphanumeric({ length: 7 }),
    prisonerName: Object.prototype.hasOwnProperty.call(params, 'prisonerName')
      ? params.prisonerName
      : {
          firstName: FactoryHelpers.optionalArrayElement(faker.person.firstName()),
          lastName: FactoryHelpers.optionalArrayElement(faker.person.lastName()),
        },
    referrerUsername: faker.internet.userName(),
    sentence,
    status,
    submittedOn: status !== 'referral_started' ? faker.date.past().toISOString() : undefined,
    tasksCompleted: Object.prototype.hasOwnProperty.call(params, 'tasksCompleted')
      ? params.tasksCompleted
      : FactoryHelpers.optionalArrayElement(faker.number.int({ max: 4, min: 1 })),
  }
})
