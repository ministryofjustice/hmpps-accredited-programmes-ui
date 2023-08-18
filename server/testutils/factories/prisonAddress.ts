import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { PrisonAddress } from '@prison-register-api'

export default Factory.define<PrisonAddress>(() => ({
  id: faker.number.int({ min: 1 }), // eslint-disable-next-line sort-keys
  addressLine1: faker.location.streetAddress(),
  addressLine2: null,
  country: faker.helpers.arrayElement(['England', 'Wales']),
  county: faker.location.county(),
  postcode: faker.location.zipCode(),
  town: faker.location.city(),
}))
