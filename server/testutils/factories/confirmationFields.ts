import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { ConfirmationFields } from '@accredited-programmes/models'

export default Factory.define<ConfirmationFields>(() => {
  return {
    hasConfirmation: faker.datatype.boolean(),
    primaryDescription: faker.lorem.sentence(),
    primaryHeading: faker.lorem.words({ max: 4, min: 2 }),
    secondaryDescription: faker.lorem.sentence(),
    secondaryHeading: faker.lorem.words({ max: 4, min: 2 }),
    warningText: faker.lorem.words({ max: 4, min: 2 }),
  }
})
