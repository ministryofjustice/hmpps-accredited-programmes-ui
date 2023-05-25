import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { CoursePrerequisite } from '@accredited-programmes/models'

class CoursePrerequisiteFactory extends Factory<CoursePrerequisite> {
  setting(description?: string) {
    return this.params({
      name: 'Setting',
      description: description || 'Custody',
    })
  }

  riskCriteria(description?: string) {
    return this.params({
      name: 'Risk criteria',
      description: description || 'High ESARA/SARA/OVP, High OGRS',
    })
  }

  criminogenicNeeds(description?: string) {
    return this.params({
      name: 'Criminogenic needs',
      description: description || 'Relationships, Thinking and Behaviour, Attitudes, Lifestyle',
    })
  }
}

export default CoursePrerequisiteFactory.define(() => ({
  name: faker.word.words(),
  description: faker.word.words(),
}))
