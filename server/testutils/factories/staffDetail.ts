import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { StaffDetail } from '@accredited-programmes-api'

export default Factory.define<StaffDetail>(() => {
  return {
    accountType: faker.helpers.arrayElement(['GENERAL', 'ADMIN']),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    primaryEmail: faker.internet.email(),
    staffId: faker.number.int(),
    username: faker.internet.username(),
  }
})
