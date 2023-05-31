import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import organisationAddressFactory from './organisationAddress'
import type { Organisation } from '@accredited-programmes/models'

export default Factory.define<Organisation>(() => ({
  id: faker.string.alpha({ length: 3, casing: 'upper' }),
  name: `HMP ${faker.location.county()}`,
  category: 'Not sure',
  address: organisationAddressFactory.build(),
}))
