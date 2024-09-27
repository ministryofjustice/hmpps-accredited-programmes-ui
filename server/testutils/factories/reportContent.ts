import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { CourseCount, ReportContent } from '@accredited-programmes-api'

const courseCount = Factory.define<CourseCount>(() => ({
  audience: faker.lorem.words(2),
  count: 1,
  name: faker.lorem.words(),
}))

export default Factory.define<ReportContent>(() => {
  const count = faker.number.int({ max: 3 })
  return {
    content: {
      count,
      courseCounts: courseCount.buildList(count),
    },
    parameters: {
      endDate: faker.date.past().toISOString().split('T')[0],
      startDate: faker.date.past().toISOString().split('T')[0],
    },
    reportType: faker.helpers.arrayElement([
      'DESELECTED_COUNT',
      'NOT_ELIGIBLE_COUNT',
      'NOT_SUITABLE_COUNT',
      'PNI_PATHWAY_COUNT',
      'PROGRAMME_COMPLETE_COUNT',
      'REFERRAL_COUNT_BY_COURSE',
      'REFERRAL_COUNT',
      'WITHDRAWN_COUNT',
    ]),
  }
})
