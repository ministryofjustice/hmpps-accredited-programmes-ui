import type { Course } from '@accredited-programmes/models'

type TagColour = 'blue' | 'green' | 'grey' | 'orange' | 'pink' | 'purple' | 'red' | 'turquoise' | 'yellow'

type Tag = {
  text: string
  classes: `govuk-tag govuk-tag--${TagColour}`
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

type CoursePresenter = Course & {
  audienceTags: Array<Tag>
  prerequisiteSummaryListRows: Array<SummaryListRow>
}

export type { CoursePresenter, SummaryListRow, TableRow, Tag, TagColour }
