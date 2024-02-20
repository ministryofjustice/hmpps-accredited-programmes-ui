import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import courseAudienceFactory from './courseAudience'
import FactoryHelpers from './factoryHelpers'
import { randomStatus, statusDescriptionAndColour } from './referral'
import { StringUtils } from '../../utils'
import type { ReferralStatus, ReferralView } from '@accredited-programmes/models'

interface ReferralViewTransientParams {
  availableStatuses: Array<ReferralStatus>
  requireOptionalFields?: boolean
}

class ReferralViewFactory extends Factory<ReferralView, ReferralViewTransientParams> {
  withAllOptionalFields() {
    return this.transient({ requireOptionalFields: true })
  }
}

export default ReferralViewFactory.define(({ params, transientParams }) => {
  const { availableStatuses, requireOptionalFields } = transientParams
  const status = params.status || randomStatus(availableStatuses)

  const referralViewWithAllFields: ReferralView = {
    id: faker.string.uuid(), // eslint-disable-next-line sort-keys
    audience: courseAudienceFactory.build(),
    conditionalReleaseDate: FactoryHelpers.randomFutureDateString(),
    courseName: `${StringUtils.convertToTitleCase(faker.color.human())} Course`,
    earliestReleaseDate: FactoryHelpers.randomFutureDateString(),
    earliestReleaseDateType: faker.helpers.arrayElement([
      'Tariff Date',
      'Parole Eligibility Date',
      'Conditional Release Date',
    ]),
    forename: faker.person.firstName(),
    nonDtoReleaseDateType: faker.helpers.arrayElement(['ARD', 'CRD', 'NPD', 'PRRD']),
    organisationId: faker.string.alpha({ casing: 'upper', length: 3 }),
    organisationName: `${faker.location.county()} (HMP)`,
    paroleEligibilityDate: FactoryHelpers.randomFutureDateString(),
    prisonNumber: faker.string.alphanumeric({ length: 7 }),
    referrerUsername: faker.internet.userName(),
    status,
    submittedOn: faker.date.past().toISOString(),
    surname: faker.person.lastName(),
    tariffExpiryDate: FactoryHelpers.randomFutureDateString(),
    tasksCompleted: faker.number.int({ max: 4, min: 1 }),
    ...statusDescriptionAndColour(status),
  }

  return {
    ...referralViewWithAllFields,
    audience: FactoryHelpers.optionalArrayElement(referralViewWithAllFields.audience),
    conditionalReleaseDate: FactoryHelpers.optionalArrayElement(referralViewWithAllFields.conditionalReleaseDate),
    courseName: FactoryHelpers.optionalArrayElement(referralViewWithAllFields.courseName),
    earliestReleaseDate: FactoryHelpers.optionalArrayElement(referralViewWithAllFields.earliestReleaseDate),
    earliestReleaseDateType: FactoryHelpers.optionalArrayElement(referralViewWithAllFields.earliestReleaseDateType),
    forename: FactoryHelpers.optionalArrayElement(referralViewWithAllFields.forename),
    nonDtoReleaseDateType: FactoryHelpers.optionalArrayElement(referralViewWithAllFields.nonDtoReleaseDateType),
    organisationId: FactoryHelpers.optionalArrayElement(referralViewWithAllFields.organisationId),
    organisationName: FactoryHelpers.optionalArrayElement(referralViewWithAllFields.organisationName),
    paroleEligibilityDate: FactoryHelpers.optionalArrayElement(referralViewWithAllFields.paroleEligibilityDate),
    prisonNumber: FactoryHelpers.optionalArrayElement(referralViewWithAllFields.prisonNumber),
    referrerUsername: FactoryHelpers.optionalArrayElement(referralViewWithAllFields.referrerUsername),
    surname: FactoryHelpers.optionalArrayElement(referralViewWithAllFields.surname),
    tariffExpiryDate: FactoryHelpers.optionalArrayElement(referralViewWithAllFields.tariffExpiryDate),
    tasksCompleted: FactoryHelpers.optionalArrayElement(referralViewWithAllFields.tasksCompleted),
    ...(requireOptionalFields ? referralViewWithAllFields : {}),
    ...params,
  }
})
