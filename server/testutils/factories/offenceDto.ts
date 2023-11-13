import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { OffenceDto } from '@prison-api'

export default Factory.define<Partial<OffenceDto>>(() => ({
  code: faker.string.alphanumeric({ casing: 'upper', length: 6 }),
  description: faker.lorem.sentence(),
  statuteCode: {
    activeFlag: 'Y',
    code: faker.string.alphanumeric({ casing: 'upper', length: 4 }),
    description: faker.lorem.sentence(),
    legislatingBodyCode: faker.string.alphanumeric({ casing: 'upper', length: 3 }),
  },
}))
