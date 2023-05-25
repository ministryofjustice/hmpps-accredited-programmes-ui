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

type TableCellWithText = {
  text: string
}

type TableCellWithHtml = {
  html: string
}

type TableCell = TableCellWithText | TableCellWithHtml

type TableRow = Array<TableCell>

export type { CourseWithPrerequisiteSummaryListRows, SummaryListRow, TableRow }
