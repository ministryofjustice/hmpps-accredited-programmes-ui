import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import FactoryHelpers from './factoryHelpers'
import type { SexualOffenceDetails } from '@accredited-programmes-api'

export default Factory.define<SexualOffenceDetails>(() => {
  return {
    categoryCode: faker.helpers.arrayElement(['AGAINST_MINORS', 'INCLUDES_VIOLENCE_FORCE_HUMILIATION', 'OTHER']),
    categoryDescription: faker.lorem.sentence(),
    description: faker.lorem.sentence(),
    hintText: FactoryHelpers.optionalArrayElement(faker.lorem.sentence()),
    id: faker.string.uuid(),
    score: faker.number.int({ max: 3, min: 1 }),
  }
})
