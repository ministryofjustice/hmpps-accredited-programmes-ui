import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import FactoryHelpers from './factoryHelpers'
import type { CourseParticipationSetting } from '@accredited-programmes-api'

class CourseParticipationSettingFactory extends Factory<CourseParticipationSetting> {
  withAllOptionalFields() {
    return this.params({
      location: faker.location.city(),
    })
  }
}

export default CourseParticipationSettingFactory.define(
  (): CourseParticipationSetting => ({
    location: FactoryHelpers.optionalArrayElement(faker.location.city()),
    type: faker.helpers.arrayElement(['custody', 'community']),
  }),
)
