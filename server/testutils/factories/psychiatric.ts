import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import FactoryHelpers from './factoryHelpers'
import type { Psychiatric } from '@accredited-programmes/models'

export default Factory.define<Psychiatric>(() => {
  return {
    description: FactoryHelpers.optionalArrayElement(faker.lorem.paragraphs({ max: 3, min: 1 })),
  }
})
