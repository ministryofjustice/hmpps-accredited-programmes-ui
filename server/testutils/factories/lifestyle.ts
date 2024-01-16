import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import FactoryHelpers from './factoryHelpers'
import type { Lifestyle } from '@accredited-programmes/models'

export default Factory.define<Lifestyle>(() => {
  return {
    activitiesEncourageOffending: FactoryHelpers.optionalArrayElement(faker.lorem.sentence()),
    lifestyleIssues: FactoryHelpers.optionalArrayElement(faker.lorem.sentence()),
  }
})
