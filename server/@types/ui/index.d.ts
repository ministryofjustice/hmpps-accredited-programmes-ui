import type { Course, CourseOffering, Organisation } from '@accredited-programmes/models'

type TagColour = 'blue' | 'green' | 'grey' | 'orange' | 'pink' | 'purple' | 'red' | 'turquoise' | 'yellow'

type Tag = {
  text: string
  classes: `govuk-tag govuk-tag--${TagColour}`
}

type SummaryListRow<T = string, U = string> = {
  key: {
    text: T
  }
  value: {
    text: U
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

type OrganisationWithOfferingEmailSummaryListRows = [
  SummaryListRow<'Prison category', string>,
  SummaryListRow<'Address', string>,
  SummaryListRow<'Region', string>,
  SummaryListRow<'Email address', CourseOffering['contactEmail']>,
]

type OrganisationWithOfferingEmailPresenter = Organisation & {
  summaryListRows: OrganisationWithOfferingEmailSummaryListRows
}

export type {
  CoursePresenter,
  OrganisationWithOfferingEmailPresenter,
  OrganisationWithOfferingEmailSummaryListRows,
  OrganisationWithOfferingId,
  SummaryListRow,
  TableRow,
  Tag,
  TagColour,
}
