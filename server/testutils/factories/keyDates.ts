import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { KeyDates } from '@accredited-programmes/models'

export default Factory.define<KeyDates>(({ sequence }) => {
  return {
    code: faker.string.alpha({ casing: 'upper', length: 3 }),
    date: faker.date.past().toISOString(),
    description: faker.lorem.sentence({ max: 4, min: 2 }),
    earliestReleaseDate: false,
    order: sequence,
    type: faker.helpers.arrayElement([
      'conditionalReleaseDate',
      'paroleEligibilityDate',
      'sentenceExpiryDate',
      'tariffDate',
    ]),
  }
})
