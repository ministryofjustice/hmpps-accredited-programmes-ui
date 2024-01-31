import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import FactoryHelpers from './factoryHelpers'
import type { Behaviour } from '@accredited-programmes/api'

export default Factory.define<Behaviour>(() => {
  return {
    achieveGoals: FactoryHelpers.optionalArrayElement(faker.lorem.sentence()),
    awarenessOfConsequences: FactoryHelpers.optionalArrayElement(faker.lorem.sentence()),
    concreteAbstractThinking: FactoryHelpers.optionalArrayElement(faker.lorem.sentence()),
    problemSolvingSkills: FactoryHelpers.optionalArrayElement(faker.lorem.sentence()),
    temperControl: FactoryHelpers.optionalArrayElement(faker.lorem.sentence()),
    understandsViewsOfOthers: FactoryHelpers.optionalArrayElement(faker.lorem.sentence()),
  }
})
