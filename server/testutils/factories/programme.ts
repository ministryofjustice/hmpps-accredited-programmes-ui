import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import programmePrerequisiteFactory from './programmePrerequisite'
import type { AccreditedProgramme } from '@accredited-programmes/models'

export default Factory.define<AccreditedProgramme>(() => ({
  name: faker.random.words(),
  programmeType: faker.random.words(),
  description: faker.lorem.sentences(),
  programmePrerequisites: programmePrerequisiteFactory.buildList(3),
}))
