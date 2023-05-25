import type { Course } from '@accredited-programmes/models'

type CourseWithPrerequisiteSummaryListRows = Course & {
  prerequisiteSummaryListRows: Array<SummaryListRow>
}

type SummaryListRow = {
  key: {
    text: string
  }
  value: {
    text: string
  }
}

export type { CourseWithPrerequisiteSummaryListRows, SummaryListRow }
