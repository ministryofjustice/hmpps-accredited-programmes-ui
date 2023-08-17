import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import courseAudienceFactory from './courseAudience'
import coursePrerequisiteFactory from './coursePrerequisite'
import buildListBetween from './factoryHelpers'
import { stringUtils } from '../../utils'
import type { Course } from '@accredited-programmes/models'

export default Factory.define<Course>(({ params }) => {
  const name = `${stringUtils.convertToTitleCase(faker.color.human())} Course`

  return {
    alternateName: stringUtils.initialiseTitle(params.name || name),
    audiences: buildListBetween(courseAudienceFactory, { max: 3, min: 1 }),
    coursePrerequisites: [
      coursePrerequisiteFactory.gender().build(),
      coursePrerequisiteFactory.learningNeeds().build(),
      coursePrerequisiteFactory.riskCriteria().build(),
      coursePrerequisiteFactory.riskCriteria().build(),
      coursePrerequisiteFactory.setting().build(),
    ],
    description: faker.lorem.sentences(),
    id: faker.string.uuid(),
    name,
  }
})
