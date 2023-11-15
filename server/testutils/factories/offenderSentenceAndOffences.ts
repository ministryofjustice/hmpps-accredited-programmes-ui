import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import FactoryHelpers from './factoryHelpers'
import type { OffenderSentenceAndOffences } from '@prison-api'

export default Factory.define<OffenderSentenceAndOffences>(() => ({
  sentenceTypeDescription: FactoryHelpers.optionalArrayElement(faker.word.words({ count: { max: 5, min: 1 } })),
}))
