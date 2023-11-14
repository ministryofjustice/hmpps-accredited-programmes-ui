import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import FactoryHelpers from './factoryHelpers'
import type { OffenceHistoryDetail } from '@prison-api'

export default Factory.define<Partial<OffenceHistoryDetail>>(() => ({
  mostSerious: faker.datatype.boolean(),
  offenceCode: FactoryHelpers.optionalArrayElement(faker.string.alphanumeric({ casing: 'upper', length: 6 })),
  offenceDate: FactoryHelpers.optionalArrayElement(faker.date.past({ years: 1 }).toISOString().substring(0, 10)),
}))
