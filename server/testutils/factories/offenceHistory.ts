import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { OffenceHistoryDetail } from '@prison-api'

export default Factory.define<OffenceHistoryDetail>(({ params }) => ({
  bookingId: faker.number.int(),
  caseId: faker.number.int(),
  courtDate: faker.date.past({ years: 1 }).toISOString().substring(0, 10),
  mostSerious: params.mostSerious || false,
  offenceCode: faker.string.alphanumeric({ casing: 'upper', length: 6 }),
  offenceDate: faker.date.past({ years: 1 }).toISOString().substring(0, 10),
  offenceDescription: faker.lorem.sentence(),
  primaryResultCode: faker.string.numeric({ length: 4 }),
  primaryResultConviction: faker.datatype.boolean(),
  primaryResultDescription: faker.lorem.sentence(3),
  secondaryResultConviction: faker.datatype.boolean(),
  statuteCode: faker.string.alphanumeric({ casing: 'upper', length: 4 }),
}))
