import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { ProgrammePrerequisite } from '@accredited-programmes/models'

export default Factory.define<ProgrammePrerequisite>(() => ({
  key: faker.word.words(),
  value: faker.word.words(),
}))
