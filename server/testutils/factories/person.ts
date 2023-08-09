import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { Person } from '@accredited-programmes/models'

export default Factory.define<Person>(({ params }) => {
  const county = faker.location.county()
  const currentPrison = params.currentPrison || `${county} (HMP)`

  return {
    name: `${faker.person.firstName()} ${faker.person.lastName()}`,
    prisonNumber: faker.string.alphanumeric({ length: 7 }),
    dateOfBirth: faker.date.birthdate().toDateString(),
    ethnicity: faker.lorem.word(),
    gender: faker.person.gender(),
    religionOrBelief: faker.lorem.word(),
    setting: 'Custody',
    currentPrison,
  }
})
