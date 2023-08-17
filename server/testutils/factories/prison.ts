import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import prisonAddressFactory from './prisonAddress'
import type { Prison } from '@prison-register-api'

export default Factory.define<Prison>(({ params }) => {
  const county = faker.location.county()
  const prisonName = params.prisonName || `${county} (HMP)`

  return {
    active: true,
    addresses: [prisonAddressFactory.build({ county })],
    categories: [faker.helpers.arrayElement(['A', 'B', 'C'])],
    contracted: faker.datatype.boolean(),
    female: faker.datatype.boolean(),
    male: faker.datatype.boolean(),
    operators: [{ name: faker.helpers.arrayElement(['H1P', 'WDMilco', 'IJE', 'Dharma Initiative']) }],
    prisonId: faker.string.alpha({ casing: 'upper', length: 3 }),
    prisonName,
    types: [
      {
        code: 'HMP',
        description: "Her Majesty's Prison",
      },
    ],
  }
})
