import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { CoursePrerequisite } from '@accredited-programmes/api'

class CoursePrerequisiteFactory extends Factory<CoursePrerequisite> {
  gender(description?: string) {
    return this.params({
      description: description || 'Male only',
      name: 'Gender',
    })
  }

  learningNeeds(description?: string) {
    return this.params({
      description: description || 'Adapted for learning difficulties and challenges (LDC)',
      name: 'Learning needs',
    })
  }

  riskCriteria(description?: string) {
    return this.params({
      description: description || 'High ESARA/SARA/OVP, High OGRS',
      name: 'Risk criteria',
    })
  }

  setting(description?: string) {
    return this.params({
      description: description || 'Custody',
      name: 'Setting',
    })
  }
}

export default CoursePrerequisiteFactory.define(() => ({
  description: faker.word.words(),
  name: faker.word.words(),
}))
