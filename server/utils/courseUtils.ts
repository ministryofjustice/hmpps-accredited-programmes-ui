import type { Course, CoursePrerequisite } from '@accredited-programmes/models'
import type { CourseWithPrerequisiteSummaryListRows, SummaryListRow } from '@accredited-programmes/ui'

const prerequisiteSummaryListRows = (prerequisites: Array<CoursePrerequisite>): Array<SummaryListRow> => {
  return prerequisites.map(prerequisite => {
    return {
      key: { text: prerequisite.name },
      value: { text: prerequisite.description },
    }
  })
}

const courseWithPrerequisiteSummaryListRows = (course: Course): CourseWithPrerequisiteSummaryListRows => {
  return {
    ...course,
    prerequisiteSummaryListRows: prerequisiteSummaryListRows(course.coursePrerequisites),
  }
}

export default courseWithPrerequisiteSummaryListRows
