import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { SentenceDetails } from '@accredited-programmes/models'

const createKeyDates = () => {
  return {
    date: faker.date.past().toISOString(),
    type: faker.helpers.arrayElement([
      'conditionalReleaseDate',
      'paroleEligibilityDate',
      'sentenceExpiryDate',
      'tariffDate',
    ]),
  }
}

const createSentence = () => {
  return {
    description: faker.lorem.sentence(),
    sentenceStartDate: faker.date.past().toISOString(),
  }
}

class SentenceDetailsFactory extends Factory<SentenceDetails> {
  withData(numberOfSentences?: number, numberOfKeyDates?: number) {
    return this.params({
      keyDates: faker.helpers.multiple(createKeyDates, {
        count: { max: numberOfKeyDates || 3, min: numberOfKeyDates || 1 },
      }),
      sentences: faker.helpers.multiple(createSentence, {
        count: { max: numberOfSentences || 3, min: numberOfSentences || 1 },
      }),
    })
  }
}

export default SentenceDetailsFactory.define(() => {
  return {
    keyDates: faker.helpers.multiple(createKeyDates, { count: { max: 3, min: 0 } }),
    sentences: faker.helpers.multiple(createSentence, { count: { max: 3, min: 0 } }),
  }
})
