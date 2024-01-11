import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { CourseParticipationOutcome } from '@accredited-programmes/models'

const randomValidYear = (): number => {
  const currentYear = new Date().getFullYear()
  return faker.number.int({ max: currentYear, min: 1990 })
}

const outcomeTypes = {
  complete(): CourseParticipationOutcome {
    return {
      status: 'complete',
      yearCompleted: randomValidYear(),
      yearStarted: undefined,
    }
  },

  incomplete(): CourseParticipationOutcome {
    return {
      status: 'incomplete',
      yearCompleted: undefined,
      yearStarted: randomValidYear(),
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
