import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { OffenceDetails } from '@accredited-programmes/ui'

export default Factory.define<OffenceDetails>(() => ({
  code: faker.string.alphanumeric({ casing: 'upper', length: 6 }),
  date: faker.date.past({ years: 10 }).toISOString().substring(0, 10),
  description: faker.lorem.sentence(),
  mostSerious: faker.datatype.boolean(),
  statuteCodeDescription: faker.lorem.sentence(),
}))
