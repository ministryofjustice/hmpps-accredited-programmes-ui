import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import courseParticipationOutcomeFactory from './courseParticipationOutcome'
import courseParticipationSettingFactory from './courseParticipationSetting'
import FactoryHelpers from './factoryHelpers'
import { StringUtils } from '../../utils'
import type { CourseParticipation } from '@accredited-programmes/models'

const courseParticipationTypes = {
  base() {
    return {
      id: faker.string.uuid(), // eslint-disable-next-line sort-keys
      addedBy: `${faker.person.firstName()} ${faker.person.lastName()}`,
      courseId: undefined,
      createdAt: `${faker.date.between({ from: '2023-09-20T00:00:00.000Z', to: new Date() })}`,
      otherCourseName: undefined,
      outcome: courseParticipationOutcomeFactory.build(),
      prisonNumber: faker.string.alphanumeric({ length: 7 }),
      setting: courseParticipationSettingFactory.build(),
      source: FactoryHelpers.optionalArrayElement(faker.word.words()),
    }
  },

  new() {
    return {
      ...this.random(),
      outcome: {
        detail: undefined,
        status: undefined,
        yearCompleted: undefined,
        yearStarted: undefined,
      },
      setting: {
        location: undefined,
        type: undefined,
      },
      source: undefined,
    }
  },

  random() {
    const type = faker.helpers.arrayElement<'withCourseId' | 'withOtherCourseName'>([
      'withCourseId',
      'withOtherCourseName',
    ])
    return this[type]()
  },

  withCourseId() {
    return {
      ...this.base(),
      courseId: faker.string.uuid(),
    }
  },

  withOtherCourseName() {
    return {
      ...this.base(),
      otherCourseName: `${StringUtils.convertToTitleCase(faker.color.human())} Course`,
    }
  },
}

class CourseParticipationFactory extends Factory<CourseParticipation> {
  new() {
    return this.params(courseParticipationTypes.new())
  }

  withCourseId() {
    return this.params(courseParticipationTypes.withCourseId())
  }

  withOtherCourseName() {
    return this.params(courseParticipationTypes.withOtherCourseName())
  }
}

export default CourseParticipationFactory.define(() => courseParticipationTypes.random())
