import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import FactoryHelpers from './factoryHelpers'
import type { Person } from '@accredited-programmes/models'

export default Factory.define<Person>(({ params }) => {
  const county = faker.location.county()
  const currentPrison = params.currentPrison || `${county} (HMP)`
  const conditionalReleaseDate =
    'conditionalReleaseDate' in params ? params.conditionalReleaseDate : FactoryHelpers.optionalRandomFutureDateString()
  const paroleEligibilityDate =
    'paroleEligibilityDate' in params ? params.conditionalReleaseDate : FactoryHelpers.optionalRandomFutureDateString()
  const tariffDate = 'tariffDate' in params ? params.tariffDate : FactoryHelpers.optionalRandomFutureDateString()

  return {
    bookingId: faker.string.numeric({ length: 10 }),
    conditionalReleaseDate,
    currentPrison,
    dateOfBirth: faker.date.birthdate().toDateString(),
    earliestReleaseDate: faker.helpers.arrayElement([conditionalReleaseDate, paroleEligibilityDate, tariffDate]),
    ethnicity: faker.lorem.word(),
    gender: faker.person.gender(),
    homeDetentionCurfewEligibilityDate: FactoryHelpers.optionalRandomFutureDateString(),
    name: `${faker.person.firstName()} ${faker.person.lastName()}`,
    paroleEligibilityDate,
    prisonNumber: faker.string.alphanumeric({ length: 7 }),
    religionOrBelief: faker.lorem.word(),
    sentenceExpiryDate: FactoryHelpers.optionalRandomFutureDateString(),
    sentenceStartDate: FactoryHelpers.optionalArrayElement([`${faker.date.past({ years: 20 })}`.substring(0, 10)]),
    setting: 'Custody',
    tariffDate,
  }
})
