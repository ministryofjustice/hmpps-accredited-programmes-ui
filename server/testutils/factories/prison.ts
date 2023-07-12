import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import prisonAddressFactory from './prisonAddress'
import type { Prison } from '@prison-register-api'

export default Factory.define<Prison>(({ params }) => {
  const county = faker.location.county()
  const prisonName = params.prisonName || `${county} (HMP)`

  return {
    prisonId: faker.string.alpha({ length: 3, casing: 'upper' }),
    prisonName,
    active: true,
    male: faker.datatype.boolean(),
    female: faker.datatype.boolean(),
    contracted: faker.datatype.boolean(),
    categories: [faker.helpers.arrayElement(['A', 'B', 'C'])],
    types: [
      {
        code: 'HMP',
        description: "Her Majesty's Prison",
      },
    ],
    addresses: [prisonAddressFactory.build({ county })],
    operators: [{ name: faker.helpers.arrayElement(['H1P', 'WDMilco', 'IJE', 'Dharma Initiative']) }],
  }
})
