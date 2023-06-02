import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { CourseAudience } from '@accredited-programmes/models'

export default Factory.define<CourseAudience>(() => ({
  id: faker.string.uuid(),
  value: faker.helpers.arrayElement([
    'Extremism',
    'General violence',
    'Intimate partner violence',
    'Online sexual violence',
    'Sexual violence',
  ]),
}))
