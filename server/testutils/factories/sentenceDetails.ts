import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import keyDatesFactory from './keyDates'
import type { SentenceDetails } from '@accredited-programmes/models'

const createSentence = () => {
  return {
    description: faker.lorem.sentence(),
    sentenceStartDate: faker.date.past().toISOString(),
  }
}

class SentenceDetailsFactory extends Factory<SentenceDetails> {
  withData(numberOfSentences?: number, numberOfKeyDates?: number) {
    return this.params({
      keyDates: keyDatesFactory.buildList(numberOfKeyDates || 3),
      sentences: faker.helpers.multiple(createSentence, {
        count: { max: numberOfSentences || 3, min: numberOfSentences || 1 },
      }),
    })
  }
}

export default SentenceDetailsFactory.define(() => {
  return {
    keyDates: keyDatesFactory.buildList(3),
    sentences: faker.helpers.multiple(createSentence, { count: { max: 3, min: 0 } }),
  }
})
