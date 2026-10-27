import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import audienceFactory from './audience'
import courseOfferingFactory from './courseOffering'
import coursePrerequisiteFactory from './coursePrerequisite'
import { StringUtils } from '../../utils'
import type { Course } from '@accredited-programmes-api'

export default Factory.define<Course>(({ params }) => {
  const audience = audienceFactory.build()
  const audienceName = params.audience || audience.name!
  const name = params.name || `${StringUtils.convertToTitleCase(faker.color.human())} Course`
  const displayName = `${name}: ${audienceName.toLowerCase()}`

  return {
    id: faker.string.uuid(), // eslint-disable-next-line sort-keys
    alternateName: StringUtils.initialiseTitle(params.name || name),
    audience: audienceName,
    audienceColour: audience.colour,
    courseOfferings: courseOfferingFactory.buildList(3),
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
    intensity: faker.helpers.arrayElement(['HIGH', 'MODERATE']),
    name,
  }
})
