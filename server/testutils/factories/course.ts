import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import coursePrerequisiteFactory from './coursePrerequisite'
import { convertToTitleCase } from '../../utils/utils'
import type { Course } from '@accredited-programmes/models'

export default Factory.define<Course>(() => ({
  id: faker.string.uuid(),
  name: `${convertToTitleCase(faker.color.human())} Course`,
  type: 'Accredited Programme',
  description: faker.lorem.sentences(),
  coursePrerequisites: [
    coursePrerequisiteFactory.setting().build(),
    coursePrerequisiteFactory.riskCriteria().build(),
    coursePrerequisiteFactory.criminogenicNeeds().build(),
  ],
}))
