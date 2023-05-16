import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { AccreditedProgramme } from '@accredited-programmes/models'
import programmePrerequisiteFactory from './programmePrerequisite'

export default Factory.define<AccreditedProgramme>(() => ({
  name: faker.word.words(),
  programmeType: faker.word.words(),
  description: faker.lorem.sentences(),
  programmePrerequisites: programmePrerequisiteFactory.buildList(3),
}))
