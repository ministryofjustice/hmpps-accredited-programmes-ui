import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import FactoryHelpers from './factoryHelpers'
import type { CourseParticipationOutcome, CourseParticipationOutcomeStatus } from '@accredited-programmes/models'

const randomNonFutureYearFrom = (minimumYear: number): number => {
  const currentYear = new Date().getFullYear()
  return faker.number.int({ max: currentYear, min: minimumYear })
}

const outcomeTypes = {
  complete() {
    return {
      detail: faker.lorem.paragraph({ max: 5, min: 0 }),
      status: 'complete' as CourseParticipationOutcomeStatus,
      yearCompleted: FactoryHelpers.optionalArrayElement(randomNonFutureYearFrom(1980)),
    }
  },

  incomplete() {
    return {
      detail: faker.lorem.paragraph({ max: 5, min: 0 }),
      status: 'incomplete' as CourseParticipationOutcomeStatus,
      yearStarted: FactoryHelpers.optionalArrayElement(randomNonFutureYearFrom(1980)),
    }
  },

  random() {
    const type = faker.helpers.arrayElement<'complete' | 'incomplete' | 'unknown'>([
      'complete',
      'incomplete',
      'unknown',
    ])
    return this[type]()
  },

  unknown() {
    return { detail: faker.lorem.paragraph({ max: 5, min: 0 }) }
  },
}

class CourseParticipationOutcomeFactory extends Factory<CourseParticipationOutcome> {
  complete() {
    return this.params(outcomeTypes.complete())
  }

  incomplete() {
    return this.params(outcomeTypes.incomplete())
  }

  unknown() {
    return this.params(outcomeTypes.unknown())
  }
}

export default CourseParticipationOutcomeFactory.define(() => outcomeTypes.random())