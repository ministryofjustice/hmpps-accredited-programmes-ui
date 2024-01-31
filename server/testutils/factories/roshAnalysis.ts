import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import FactoryHelpers from './factoryHelpers'
import type { RoshAnalysis } from '@accredited-programmes/api'

export default Factory.define<RoshAnalysis>(() => {
  return {
    anyoneElsePresent: FactoryHelpers.optionalArrayElement(faker.lorem.paragraphs({ max: 3, min: 1 })),
    howDone: FactoryHelpers.optionalArrayElement(faker.lorem.paragraphs({ max: 3, min: 1 })),
    offenceDetails: FactoryHelpers.optionalArrayElement(faker.lorem.paragraphs({ max: 3, min: 1 })),
    sources: FactoryHelpers.optionalArrayElement(faker.lorem.paragraph({ max: 3, min: 1 })),
    whereAndWhen: FactoryHelpers.optionalArrayElement(faker.lorem.paragraphs({ max: 3, min: 1 })),
    whoVictims: FactoryHelpers.optionalArrayElement(faker.lorem.paragraphs({ max: 3, min: 1 })),
    whyDone: FactoryHelpers.optionalArrayElement(faker.lorem.paragraphs({ max: 3, min: 1 })),
  }
})
