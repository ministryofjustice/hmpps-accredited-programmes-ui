import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import coursePrerequisiteFactory from './coursePrerequisite'
import type { Course } from '@accredited-programmes/models'

export default Factory.define<Course>(() => ({
  name: faker.word.words(),
  type: faker.word.words(),
  description: faker.lorem.sentences(),
  coursePrerequisites: coursePrerequisiteFactory.buildList(3),
}))
