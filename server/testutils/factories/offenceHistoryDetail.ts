import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { OffenceHistoryDetail } from '@prison-api'

export default Factory.define<Partial<OffenceHistoryDetail>>(() => ({
  mostSerious: faker.datatype.boolean(),
  offenceCode: faker.string.alphanumeric({ casing: 'upper', length: 6 }),
  offenceDate: faker.date.past({ years: 1 }).toISOString().substring(0, 10),
}))
