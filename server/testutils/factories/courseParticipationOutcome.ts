import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import FactoryHelpers from './factoryHelpers'
import type { CourseParticipationOutcome } from '@accredited-programmes/models'

const randomNonFutureYearFrom = (minimumYear: number): number => {
  const currentYear = new Date().getFullYear()
  return faker.number.int({ max: currentYear, min: minimumYear })
}

const outcomeTypes = {
  complete(): CourseParticipationOutcome {
    return {
      status: 'complete',
      yearCompleted: FactoryHelpers.optionalArrayElement(randomNonFutureYearFrom(1980)),
    }
  },

  incomplete(): CourseParticipationOutcome {
    return {
      status: 'incomplete',
      yearStarted: FactoryHelpers.optionalArrayElement(randomNonFutureYearFrom(1980)),
    }
  },

  random() {
    const type = faker.helpers.arrayElement<'complete' | 'incomplete'>(['complete', 'incomplete'])
    return this[type]()
  },
}

class CourseParticipationOutcomeFactory extends Factory<CourseParticipationOutcome> {
  complete() {
    return this.params(outcomeTypes.complete())
  }

  incomplete() {
    return this.params(outcomeTypes.incomplete())
  }
}

export default CourseParticipationOutcomeFactory.define(() => outcomeTypes.random())
