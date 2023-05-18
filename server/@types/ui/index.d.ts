import { Course } from '@accredited-programmes/models'

type CourseListItem = Omit<Course, 'coursePrerequisites'> & {
  prerequisitesSummaryListRows: Array<SummaryListRow>
}

type SummaryListRow = {
  key: {
    text: string
  }
  value: {
    text: string
  }
}

export type { CourseListItem, SummaryListRow }
