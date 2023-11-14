import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import FactoryHelpers from './factoryHelpers'
import type { OffenceDetails } from '@accredited-programmes/ui'

export default Factory.define<OffenceDetails>(() => ({
  code: FactoryHelpers.optionalArrayElement(faker.string.alphanumeric({ casing: 'upper', length: 6 })),
  date: FactoryHelpers.optionalArrayElement(faker.date.past({ years: 10 }).toISOString().substring(0, 10)),
  description: FactoryHelpers.optionalArrayElement(faker.lorem.sentence()),
  mostSerious: FactoryHelpers.optionalArrayElement(faker.datatype.boolean()),
  statuteCodeDescription: FactoryHelpers.optionalArrayElement(faker.lorem.sentence()),
}))
