import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { CoursePrerequisite } from '@accredited-programmes/models'

class CoursePrerequisiteFactory extends Factory<CoursePrerequisite> {
  gender(description?: string) {
    return this.params({
      name: 'Gender',
      description: description || 'Male only',
    })
  }

  learningNeeds(description?: string) {
    return this.params({
      name: 'Learning needs',
      description: description || 'Adapted for learning difficulties and challenges (LDC)',
    })
  }

  riskCriteria(description?: string) {
    return this.params({
      name: 'Risk criteria',
      description: description || 'High ESARA/SARA/OVP, High OGRS',
    })
  }

  setting(description?: string) {
    return this.params({
      name: 'Setting',
      description: description || 'Custody',
    })
  }
}

export default CoursePrerequisiteFactory.define(() => ({
  name: faker.word.words(),
  description: faker.word.words(),
}))
