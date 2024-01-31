import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { CourseAudience } from '@accredited-programmes/models'

export default Factory.define<CourseAudience>(() =>
  faker.helpers.arrayElement([
    'Extremism offence',
    'Gang offence',
    'General offence',
    'General violence offence',
    'Intimate partner violence offence',
    'Sexual offence',
  ]),
)
