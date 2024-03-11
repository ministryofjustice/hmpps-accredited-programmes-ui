import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { CourseOffering } from '@accredited-programmes/models'

export default Factory.define<CourseOffering>(({ params }) => {
  const organisationId = params.organisationId || faker.string.alpha({ casing: 'upper', length: 3 })

  return {
    id: faker.string.uuid(), // eslint-disable-next-line sort-keys
    contactEmail: `nobody-${organisationId.toLowerCase()}@digital.justice.gov.uk`,
    organisationEnabled: faker.datatype.boolean(),
    organisationId,
    referable: faker.datatype.boolean(),
    secondaryContactEmail: faker.helpers.arrayElement([
      `nobody2-${organisationId.toLowerCase()}@digital.justice.gov.uk`,
      null,
    ]),
  }
})
