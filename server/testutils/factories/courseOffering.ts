import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { CourseOffering } from '@accredited-programmes/models'

const organisationId = faker.string.alpha({ casing: 'upper', length: 3 })

export default Factory.define<CourseOffering>(() => ({
  contactEmail: `nobody-${organisationId.toLowerCase()}@digital.justice.gov.uk`,
  id: faker.string.uuid(),
  organisationId: faker.string.alpha({ casing: 'upper', length: 3 }),
  secondaryContactEmail: null,
}))
