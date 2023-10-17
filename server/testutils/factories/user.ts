import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { User } from '@accredited-programmes/users'

export default Factory.define<User>(() => {
  const userId = faker.string.uuid()
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()

  return {
    active: true,
    activeCaseLoadId: faker.string.alpha({ casing: 'upper', length: 3 }),
    authSource: 'nomis',
    name: `${firstName} ${lastName}`,
    staffId: faker.number.int(),
    userId,
    username: faker.internet.userName({ firstName, lastName }),
    uuid: userId,
  }
})
