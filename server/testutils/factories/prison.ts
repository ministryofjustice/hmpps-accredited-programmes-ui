import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import prisonAddressFactory from './prisonAddress'
import type { Prison } from '@prison-api'

export default Factory.define<Prison>(({ params }) => {
  const locality = params.locality || faker.location.county()
  const city = params.city || faker.location.city()
  const country = params.country || 'United Kingdom'
  const premise = params.premise || `HMP ${locality}`

  return {
    agencyId: faker.string.alpha({ length: 3, casing: 'upper' }),
    premise,
    locality,
    city,
    country,
    addresses: [
      prisonAddressFactory.build({ premise, locality, country, town: city, primary: true }),
      prisonAddressFactory.build({ premise, primary: false }),
    ],
  }
})
