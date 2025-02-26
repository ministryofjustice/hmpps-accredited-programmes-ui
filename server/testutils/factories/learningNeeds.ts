import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import FactoryHelpers from './factoryHelpers'
import type { LearningNeeds } from '@accredited-programmes-api'

const problemAreaOptions = ['Numeracy', 'Reading', 'Writing']

class LearningNeedsFactory extends Factory<LearningNeeds> {
  withAllOptionalFields() {
    return this.params({
      basicSkillsScore: faker.number.int().toString(),
      basicSkillsScoreDescription: faker.lorem.sentence(),
      learningDifficulties: faker.lorem.sentence(),
      noFixedAbodeOrTransient: faker.datatype.boolean(),
      problemAreas: faker.helpers.arrayElements(problemAreaOptions),
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
    problemAreas: FactoryHelpers.optionalArrayElement<LearningNeeds['problemAreas']>([
      faker.helpers.arrayElements(problemAreaOptions, { max: 3, min: 0 }),
    ]),
    problemsReadWriteNum: FactoryHelpers.optionalArrayElement(faker.lorem.sentence()),
    qualifications: FactoryHelpers.optionalArrayElement(faker.lorem.sentence()),
    workRelatedSkills: FactoryHelpers.optionalArrayElement(faker.lorem.sentence()),
  }),
)
