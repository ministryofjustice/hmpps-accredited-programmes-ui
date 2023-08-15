import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { Prisoner } from '@prisoner-offender-search'

export default Factory.define<Prisoner>(({ params }) => {
  const county = faker.location.county()
  const prisonName = params.prisonName || `${county} (HMP)`

  const dateOfBirth = faker.date.birthdate({ min: 18, mode: 'age' })
  const year = dateOfBirth.getFullYear()
  const month = dateOfBirth.getMonth() + 1
  const day = dateOfBirth.getDate()

  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    prisonerNumber: faker.string.alphanumeric({ length: 7 }),
    dateOfBirth: [year, month, day].join('-'),
    ethnicity: faker.lorem.word(),
    gender: faker.person.gender(),
    religion: faker.lorem.word(),
    prisonName,
  }
})
