import type { Course, CourseOffering, Organisation } from '@accredited-programmes/models'

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

type OrganisationWithOfferingId = Organisation & {
  courseOfferingId: CourseOffering['id']
}

export type { CoursePresenter, OrganisationWithOfferingId, SummaryListRow, TableRow, Tag, TagColour }
