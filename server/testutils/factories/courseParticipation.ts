import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import courseParticipationOutcomeFactory from './courseParticipationOutcome'
import courseParticipationSettingFactory from './courseParticipationSetting'
import FactoryHelpers from './factoryHelpers'
import { StringUtils } from '../../utils'
import type { CourseParticipation } from '@accredited-programmes/models'

class CourseParticipationFactory extends Factory<CourseParticipation> {
  new() {
    return this.params({
      detail: undefined,
      outcome: undefined,
      setting: undefined,
      source: undefined,
    })
  }

  withAllOptionalFields() {
    return this.params({
      outcome: courseParticipationOutcomeFactory.withAllOptionalFields().build(),
      setting: courseParticipationSettingFactory.withAllOptionalFields().build(),
      source: faker.word.words(),
    })
  }
}

export default CourseParticipationFactory.define(() => ({
  id: faker.string.uuid(), // eslint-disable-next-line sort-keys
  addedBy: `${faker.person.firstName()} ${faker.person.lastName()}`,
  courseName: `${StringUtils.convertToTitleCase(faker.color.human())} Course`,
  createdAt: `${faker.date.between({ from: '2023-09-20T00:00:00.000Z', to: new Date() })}`,
  detail: faker.lorem.paragraph({ max: 5, min: 0 }),
  outcome: FactoryHelpers.optionalArrayElement([courseParticipationOutcomeFactory.build()]),
  prisonNumber: faker.string.alphanumeric({ length: 7 }),
  setting: FactoryHelpers.optionalArrayElement([courseParticipationSettingFactory.build()]),
  source: FactoryHelpers.optionalArrayElement(faker.word.words()),
}))
