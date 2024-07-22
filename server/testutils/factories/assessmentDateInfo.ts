import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import FactoryHelpers from './factoryHelpers'
import type { AssessmentDateInfo } from '@accredited-programmes/models'

export default Factory.define<AssessmentDateInfo>(() => {
  return {
    hasOpenAssessment: FactoryHelpers.optionalArrayElement(faker.datatype.boolean()),
    recentCompletedAssessmentDate: FactoryHelpers.optionalArrayElement(faker.date.recent().toISOString()),
  }
})
