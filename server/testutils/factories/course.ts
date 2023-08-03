import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import courseAudienceFactory from './courseAudience'
import coursePrerequisiteFactory from './coursePrerequisite'
import buildListBetween from './factoryHelpers'
import { convertToTitleCase, initialiseTitle } from '../../utils/stringUtils'
import type { Course } from '@accredited-programmes/models'

export default Factory.define<Course>(({ params }) => {
  const name = `${convertToTitleCase(faker.color.human())} Course`

  return {
    id: faker.string.uuid(),
    name,
    alternateName: initialiseTitle(params.name || name),
    description: faker.lorem.sentences(),
    audiences: buildListBetween(courseAudienceFactory, { min: 1, max: 3 }),
    coursePrerequisites: [
      coursePrerequisiteFactory.gender().build(),
      coursePrerequisiteFactory.learningNeeds().build(),
      coursePrerequisiteFactory.riskCriteria().build(),
      coursePrerequisiteFactory.riskCriteria().build(),
      coursePrerequisiteFactory.setting().build(),
    ],
  }
})
