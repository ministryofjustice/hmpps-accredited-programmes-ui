import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { Prison } from '../../@types/prisonApi'

export default Factory.define<Prison>(() => {
  const county = faker.location.county()
  const country = faker.location.country()
  const city = faker.location.city()
  const streetAddress = faker.location.streetAddress()
  const premise = `HMP ${county}`

  return {
    agencyId: faker.string.alpha({ length: 3, casing: 'upper' }),
    premise,
    locality: county,
    city,
    country,
    addresses: [
      {
        premise,
        street: streetAddress,
        locality: county,
        town: city,
        postalCode: faker.location.zipCode(),
        country,
        primary: true,
      },
    ],
  }
})
