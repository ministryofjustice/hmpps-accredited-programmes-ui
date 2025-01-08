import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import FactoryHelpers from './factoryHelpers'
import type { CourseParticipationOutcome } from '@accredited-programmes-api'

const randomValidYear = (): number => {
  const currentYear = new Date().getFullYear()
  return faker.number.int({ max: currentYear, min: 1990 })
}

const outcomeTypes = {
  complete(requireOptionalFields = false): CourseParticipationOutcome {
    return {
      status: 'complete',
      yearCompleted: requireOptionalFields ? randomValidYear() : FactoryHelpers.optionalArrayElement(randomValidYear()),
      yearStarted: undefined,
    }
  },

  incomplete(requireOptionalFields = false): CourseParticipationOutcome {
    return {
      status: 'incomplete',
      yearCompleted: undefined,
      yearStarted: requireOptionalFields ? randomValidYear() : FactoryHelpers.optionalArrayElement(randomValidYear()),
    }
  },

  random(requireOptionalFields = false) {
    const type = faker.helpers.arrayElement<'complete' | 'incomplete'>(['complete', 'incomplete'])
    return this[type](requireOptionalFields)
  },
}

class CourseParticipationOutcomeFactory extends Factory<CourseParticipationOutcome> {
  complete(requireOptionalFields = false) {
    return this.params(outcomeTypes.complete(requireOptionalFields))
  }

  incomplete(requireOptionalFields = false) {
    return this.params(outcomeTypes.incomplete(requireOptionalFields))
  }

  withAllOptionalFields() {
    return this.params(outcomeTypes.random(true))
  }
}

export default CourseParticipationOutcomeFactory.define(() => outcomeTypes.random())
