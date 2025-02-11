import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import FactoryHelpers from './factoryHelpers'
import { StringUtils } from '../../utils'
import type { Prisoner } from '@prisoner-search'

const generateBookingId = () => faker.string.numeric({ length: 10 })

class PrisonerFactory extends Factory<Prisoner> {
  // returns a `PrisonerWithBookingId`
  withBookingId(bookingId?: Prisoner['bookingId']) {
    return this.params({
      bookingId: bookingId || generateBookingId(),
    })
  }
}

export default PrisonerFactory.define(({ params }) => {
  const county = faker.location.county()
  const prisonName = params.prisonName || `${county} (HMP)`

  const dateOfBirth = faker.date.birthdate({ max: 99, min: 18, mode: 'age' })
  const year = dateOfBirth.getFullYear()
  const month = dateOfBirth.getMonth() + 1
  const day = dateOfBirth.getDate()

  return {
    bookingId: FactoryHelpers.optionalArrayElement(generateBookingId()),
    conditionalReleaseDate: FactoryHelpers.optionalRandomFutureDateString(),
    dateOfBirth: [year, month, day].join('-'),
    ethnicity: StringUtils.properCase(faker.lorem.word()),
    firstName: faker.person.firstName(),
    gender: faker.person.gender(),
    homeDetentionCurfewEligibilityDate: FactoryHelpers.optionalRandomFutureDateString(),
    indeterminateSentence: FactoryHelpers.optionalArrayElement([faker.datatype.boolean()]),
    lastName: faker.person.lastName(),
    paroleEligibilityDate: FactoryHelpers.optionalRandomFutureDateString(),
    prisonName,
    prisonerNumber: faker.string.alphanumeric({ casing: 'upper', length: 7 }),
    raceCode: faker.helpers.arrayElement(['W1', 'W9', 'O9', 'B2', 'NS']),
    religion: StringUtils.properCase(faker.lorem.word()),
    sentenceExpiryDate: FactoryHelpers.optionalRandomFutureDateString(),
    sentenceStartDate: FactoryHelpers.optionalArrayElement([`${faker.date.past({ years: 20 })}`.substring(0, 10)]),
    tariffDate: FactoryHelpers.optionalRandomFutureDateString(),
  }
})
