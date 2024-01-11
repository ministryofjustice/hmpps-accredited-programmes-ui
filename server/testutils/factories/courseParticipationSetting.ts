import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { CourseParticipationSetting } from '@accredited-programmes/models'

export default Factory.define<CourseParticipationSetting>(() => ({
  location: faker.location.city(),
  type: faker.helpers.arrayElement(['custody', 'community']),
}))
