import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import FactoryHelpers from './factoryHelpers'
import type { Prisoner } from '@prisoner-search'

export default Factory.define<Prisoner>(({ params }) => {
  const county = faker.location.county()
  const prisonName = params.prisonName || `${county} (HMP)`

  const dateOfBirth = faker.date.birthdate({ min: 18, mode: 'age' })
  const year = dateOfBirth.getFullYear()
  const month = dateOfBirth.getMonth() + 1
  const day = dateOfBirth.getDate()

  return {
    bookingId: faker.string.numeric({ length: 10 }),
    dateOfBirth: [year, month, day].join('-'),
    ethnicity: faker.lorem.word(),
    firstName: faker.person.firstName(),
    gender: faker.person.gender(),
    lastName: faker.person.lastName(),
    prisonName,
    prisonerNumber: faker.string.alphanumeric({ length: 7 }),
    religion: faker.lorem.word(),
    sentenceStartDate: FactoryHelpers.optionalArrayElement([`${faker.date.past({ years: 20 })}`.substring(0, 10)]),
  }
})
