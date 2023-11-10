import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { OffenceDto } from '@prison-api'

export default Factory.define<OffenceDto>(() => ({
  activeFlag: 'Y',
  code: faker.string.alphanumeric({ casing: 'upper', length: 6 }),
  description: faker.lorem.sentence(),
  hoCode: {
    activeFlag: 'Y',
    code: `${faker.string.numeric({ length: 3 })}/${faker.string.numeric({ length: 2 })}`,
    description: faker.lorem.sentence(),
  },
  severityRanking: faker.string.numeric(),
  statuteCode: {
    activeFlag: 'Y',
    code: faker.string.alphanumeric({ casing: 'upper', length: 4 }),
    description: faker.lorem.sentence(),
    legislatingBodyCode: faker.string.alphanumeric({ casing: 'upper', length: 3 }),
  },
}))
