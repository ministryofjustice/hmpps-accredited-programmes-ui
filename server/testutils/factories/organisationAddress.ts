import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { OrganisationAddress } from '@accredited-programmes/models'

export default Factory.define<OrganisationAddress>(() => ({
  addressLine1: faker.location.streetAddress(),
  addressLine2: null,
  town: faker.location.city(),
  county: faker.location.county(),
  postalCode: faker.location.zipCode(),
  country: faker.helpers.arrayElement(['England', 'Wales']),
}))
