import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import coursePrerequisiteFactory from './coursePrerequisite'
import FactoryHelpers from './factoryHelpers'
import { StringUtils } from '../../utils'
import type { Course } from '@accredited-programmes/api'

export const randomAudience = () =>
  faker.helpers.arrayElement([
    'Extremism offence',
    'Gang offence',
    'General offence',
    'General violence offence',
    'Intimate partner violence offence',
    'Sexual offence',
  ])

export default Factory.define<Course>(({ params }) => {
  const name = `${StringUtils.convertToTitleCase(faker.color.human())} Course`

  return {
    id: faker.string.uuid(), // eslint-disable-next-line sort-keys
    alternateName: FactoryHelpers.optionalArrayElement(StringUtils.initialiseTitle(params.name || name)),
    audience: randomAudience(),
    coursePrerequisites: [
      coursePrerequisiteFactory.gender().build(),
      coursePrerequisiteFactory.learningNeeds().build(),
      coursePrerequisiteFactory.riskCriteria().build(),
      coursePrerequisiteFactory.riskCriteria().build(),
      coursePrerequisiteFactory.setting().build(),
    ],
    description: FactoryHelpers.optionalArrayElement(faker.lorem.sentences()),
    name,
    referable: true, // this is unused and needs removing once API PR #265 is merged
  }
})
