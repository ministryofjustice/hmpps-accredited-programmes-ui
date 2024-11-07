import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { CoursePrerequisite } from '@accredited-programmes-api'

class CoursePrerequisiteFactory extends Factory<CoursePrerequisite> {
  equivalentLDCProgramme(description?: string) {
    return this.params({
      description: description || 'Becoming New Me Plus',
      name: 'Equivalent LDC programme',
    })
  }

  equivalentNonLDCProgramme(description?: string) {
    return this.params({
      description: description || 'Kaizen',
      name: 'Equivalent non-LDC programme',
    })
  }

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

  needsCriteria(description?: string) {
    return this.params({
      description: description || 'High need, based on their programme needs identifier score',
      name: 'Needs criteria',
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

  suitableForPeopleWithLDCs(description?: string) {
    return this.params({
      description: description || 'Yes',
      name: 'Suitable for people with learning disabilities or challenges (LDC)?',
    })
  }

  timeToComplete(description?: string) {
    return this.params({
      description: description || '6 months',
      name: 'Time to complete',
    })
  }
}

export default CoursePrerequisiteFactory.define(() => ({
  description: faker.word.words(),
  name: faker.word.words(),
}))
