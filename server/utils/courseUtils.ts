import { omit } from 'lodash'

import { Course, CoursePrerequisite } from '@accredited-programmes/models'
import { CourseListItem, SummaryListRow } from '@accredited-programmes/ui'

export const prerequisiteSummaryListRows = (prerequisites: Array<CoursePrerequisite>): Array<SummaryListRow> => {
  return prerequisites.map(prerequisite => {
    return {
      key: { text: prerequisite.name },
      value: { text: prerequisite.description },
    }
  })
}

export const courseListItems = (courses: Array<Course>): Array<CourseListItem> => {
  return courses.map(course => {
    const prerequisitesSummaryListRows = prerequisiteSummaryListRows(course.coursePrerequisites)

    return {
      ...omit(course, ['coursePrerequisites']),
      prerequisitesSummaryListRows,
    }
  })
}
