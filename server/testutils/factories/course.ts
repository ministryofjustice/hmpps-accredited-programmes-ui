import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import courseAudienceFactory from './courseAudience'
import coursePrerequisiteFactory from './coursePrerequisite'
import { StringUtils } from '../../utils'
import type { Course } from '@accredited-programmes-api'

export default Factory.define<Course>(({ params }) => {
  const audience = params.audience || courseAudienceFactory.build()
  const name = params.name || `${StringUtils.convertToTitleCase(faker.color.human())} Course`
  const displayName = `${name}: ${audience.toLowerCase()}`

  return {
    id: faker.string.uuid(), // eslint-disable-next-line sort-keys
    alternateName: StringUtils.initialiseTitle(params.name || name),
    audience,
    audienceColour: faker.helpers.arrayElement([
      'blue',
      'green',
      'grey',
      'light-blue',
      'orange',
      'pink',
      'purple',
      'red',
      'turquoise',
      'yellow',
    ]),
    coursePrerequisites: [
      coursePrerequisiteFactory.gender().build(),
      coursePrerequisiteFactory.learningNeeds().build(),
      coursePrerequisiteFactory.riskCriteria().build(),
      coursePrerequisiteFactory.riskCriteria().build(),
      coursePrerequisiteFactory.setting().build(),
      coursePrerequisiteFactory.needsCriteria().build(),
      coursePrerequisiteFactory.suitableForPeopleWithLDCs().build(),
      coursePrerequisiteFactory.equivalentNonLDCProgramme().build(),
      coursePrerequisiteFactory.equivalentLDCProgramme().build(),
      coursePrerequisiteFactory.timeToComplete().build(),
    ],
    description: faker.lorem.sentences(),
    displayName,
    displayOnProgrammeDirectory: true,
    name,
  }
})
