import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import FactoryHelpers from './factoryHelpers'
import type { LearningNeeds } from '@accredited-programmes/models'

class LearningNeedsFactory extends Factory<LearningNeeds> {
  withAllOptionalFields() {
    return this.params({
      basicSkillsScore: faker.number.int().toString(),
      basicSkillsScoreDescription: faker.lorem.sentence(),
      learningDifficulties: faker.lorem.sentence(),
      noFixedAbodeOrTransient: faker.datatype.boolean(),
      problemsReadWriteNum: faker.lorem.sentence(),
      qualifications: faker.lorem.sentence(),
      workRelatedSkills: faker.lorem.sentence(),
    })
  }
}

export default LearningNeedsFactory.define(
  (): LearningNeeds => ({
    basicSkillsScore: FactoryHelpers.optionalArrayElement(faker.number.int().toString()),
    basicSkillsScoreDescription: FactoryHelpers.optionalArrayElement(faker.lorem.sentence()),
    learningDifficulties: FactoryHelpers.optionalArrayElement(faker.lorem.sentence()),
    noFixedAbodeOrTransient: FactoryHelpers.optionalArrayElement(faker.datatype.boolean()),
    problemsReadWriteNum: FactoryHelpers.optionalArrayElement(faker.lorem.sentence()),
    qualifications: FactoryHelpers.optionalArrayElement(faker.lorem.sentence()),
    workRelatedSkills: FactoryHelpers.optionalArrayElement(faker.lorem.sentence()),
  }),
)
