import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { PrisonAddress } from '@prison-register-api'

export default Factory.define<PrisonAddress>(() => ({
  id: faker.number.int({ min: 1 }),
  addressLine1: faker.location.streetAddress(),
  addressLine2: null,
  town: faker.location.city(),
  county: faker.location.county(),
  postcode: faker.location.zipCode(),
  country: faker.helpers.arrayElement(['England', 'Wales']),
}))
