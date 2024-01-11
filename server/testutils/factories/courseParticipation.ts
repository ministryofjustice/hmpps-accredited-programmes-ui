import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import courseParticipationOutcomeFactory from './courseParticipationOutcome'
import courseParticipationSettingFactory from './courseParticipationSetting'
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
}

export default CourseParticipationFactory.define(() => ({
  id: faker.string.uuid(), // eslint-disable-next-line sort-keys
  addedBy: `${faker.person.firstName()} ${faker.person.lastName()}`,
  courseName: `${StringUtils.convertToTitleCase(faker.color.human())} Course`,
  createdAt: `${faker.date.between({ from: '2023-09-20T00:00:00.000Z', to: new Date() })}`,
  detail: faker.lorem.paragraph({ max: 5, min: 0 }),
  outcome: courseParticipationOutcomeFactory.build(),
  prisonNumber: faker.string.alphanumeric({ length: 7 }),
  setting: courseParticipationSettingFactory.build(),
  source: faker.word.words(),
}))
