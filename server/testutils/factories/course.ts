import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import courseAudienceFactory from './courseAudience'
import coursePrerequisiteFactory from './coursePrerequisite'
import buildListBetween from './factoryHelpers'
import { convertToTitleCase } from '../../utils/utils'
import type { Course } from '@accredited-programmes/models'

export default Factory.define<Course>(({ params }) => ({
  id: faker.string.uuid(),
  name: `${convertToTitleCase(faker.color.human())} Course`,
  description: faker.lorem.sentences(),
  audiences: params.audiences || buildListBetween(courseAudienceFactory, { min: 1, max: 3 }),
  coursePrerequisites: [
    coursePrerequisiteFactory.setting().build(),
    coursePrerequisiteFactory.riskCriteria().build(),
    coursePrerequisiteFactory.criminogenicNeeds().build(),
  ],
}))
