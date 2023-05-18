import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { CoursePrerequisite } from '@accredited-programmes/models'

export default Factory.define<CoursePrerequisite>(() => ({
  name: faker.word.words(),
  description: faker.word.words(),
}))
