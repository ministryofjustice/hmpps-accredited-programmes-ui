import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import FactoryHelpers from './factoryHelpers'
import type { DrugAlcoholDetail } from '@accredited-programmes/models'

export default Factory.define<DrugAlcoholDetail>(() => {
  const problemOptions = ['0-No problems', '1-Some problems']

  return {
    alcohol: {
      alcoholIssuesDetails: FactoryHelpers.optionalArrayElement(faker.lorem.sentence()),
      alcoholLinkedToHarm: FactoryHelpers.optionalArrayElement(['Yes', 'No']),
      bingeDrinking: FactoryHelpers.optionalArrayElement(problemOptions),
      frequencyAndLevel: FactoryHelpers.optionalArrayElement(problemOptions),
    },
    drug: {
      drugsMajorActivity: FactoryHelpers.optionalArrayElement(faker.lorem.sentence()),
      levelOfUseOfMainDrug: FactoryHelpers.optionalArrayElement(problemOptions),
    },
  }
})
