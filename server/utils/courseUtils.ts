import { omit } from 'lodash'

import type { Course, CoursePrerequisite } from '@accredited-programmes/models'
import type { CourseListItem, SummaryListRow } from '@accredited-programmes/ui'

const prerequisiteSummaryListRows = (prerequisites: Array<CoursePrerequisite>): Array<SummaryListRow> => {
  return prerequisites.map(prerequisite => {
    return {
      key: { text: prerequisite.name },
      value: { text: prerequisite.description },
    }
  })
}

const courseListItems = (courses: Array<Course>): Array<CourseListItem> => {
  return courses.map(course => {
    const prerequisitesSummaryListRows = prerequisiteSummaryListRows(course.coursePrerequisites)

    return {
      ...omit(course, ['coursePrerequisites']),
      prerequisitesSummaryListRows,
    }
  })
}

export { courseListItems, prerequisiteSummaryListRows }
