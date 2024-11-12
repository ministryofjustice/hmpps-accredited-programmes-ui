import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { User } from '@manage-users-api'

export default Factory.define<User>(() => {
  const userId = faker.string.uuid()
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const name = `${firstName} ${lastName}`

  return {
    active: true,
    activeCaseLoadId: faker.string.alpha({ casing: 'upper', length: 3 }),
    authSource: 'nomis',
    name: faker.helpers.arrayElement([name, name.toLowerCase()]),
    staffId: faker.number.int(),
    userId,
    username: faker.internet.username({ firstName, lastName }),
    uuid: userId,
  }
})
