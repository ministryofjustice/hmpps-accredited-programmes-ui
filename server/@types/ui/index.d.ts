import { Course } from '@accredited-programmes/models'

export type SummaryListRow = {
  key: {
    text: string
  }
  value: {
    text: string
  }
}

export type CourseListItem = Omit<Course, 'coursePrerequisites'> & {
  prerequisitesSummaryListRows: Array<SummaryListRow>
}
