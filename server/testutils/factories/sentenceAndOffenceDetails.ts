import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { SentenceAndOffenceDetails } from '@prison-api'

export default Factory.define<SentenceAndOffenceDetails>(() => ({
  sentenceDate: `${faker.date.past({ years: 20 })}`.substring(0, 10),
  sentenceTypeDescription: faker.word.words({ count: { max: 5, min: 1 } }),
}))
