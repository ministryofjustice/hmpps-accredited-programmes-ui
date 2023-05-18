import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { PrisonAddress } from '@prison-api'

export default Factory.define<PrisonAddress>(({ params }) => {
  const locality = params.locality || faker.location.county()
  const premise = `HMP ${locality}`

  return {
    premise,
    street: faker.location.streetAddress(),
    locality,
    town: faker.location.city(),
    postalCode: faker.location.zipCode(),
    country: 'United Kingdom',
    primary: true,
  }
})
