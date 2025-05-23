import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import organisationAddressFactory from './organisationAddress'
import type { Organisation } from '@accredited-programmes/models'

export default Factory.define<Organisation>(() => ({
  id: faker.string.alpha({ casing: 'upper', length: 3 }), // eslint-disable-next-line sort-keys
  address: organisationAddressFactory.build(),
  category: 'Not sure',
  female: false,
  name: `${faker.location.county()} (HMP)`,
}))
