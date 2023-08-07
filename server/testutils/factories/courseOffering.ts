import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { CourseOffering } from '@accredited-programmes/models'

const organisationId = faker.string.alpha({ length: 3, casing: 'upper' })

export default Factory.define<CourseOffering>(() => ({
  id: faker.string.uuid(),
  organisationId: faker.string.alpha({ length: 3, casing: 'upper' }),
  contactEmail: `nobody-${organisationId.toLowerCase()}@digital.justice.gov.uk`,
  secondaryContactEmail: null,
}))
