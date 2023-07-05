import type { Course, CourseOffering, Organisation } from '@accredited-programmes/models'

type ObjectWithTextString<T = string> = {
  text: T
}

type ObjectWithHtmlString = {
  html: string
}

type ObjectWithTextOrHtmlString = ObjectWithTextString | ObjectWithHtmlString

type TagColour = 'blue' | 'green' | 'grey' | 'orange' | 'pink' | 'purple' | 'red' | 'turquoise' | 'yellow'

type Tag = ObjectWithTextString & {
  classes: `govuk-tag govuk-tag--${TagColour}`
}

type SummaryListRow<T = string, U = ObjectWithTextOrHtmlString> = {
  key: ObjectWithTextString<T>
  value: U
}

type TableRow = Array<ObjectWithTextOrHtmlString>

type CoursePresenter = Course & {
  nameAndAlternateName: string
  audienceTags: Array<Tag>
  prerequisiteSummaryListRows: Array<SummaryListRow>
}

type OrganisationWithOfferingId = Organisation & {
  courseOfferingId: CourseOffering['id']
}

type OrganisationWithOfferingEmailSummaryListRows = [
  SummaryListRow<'Address', ObjectWithTextString>,
  SummaryListRow<'Region', ObjectWithTextString>,
  SummaryListRow<'Email address', ObjectWithHtmlString>,
]

type OrganisationWithOfferingEmailPresenter = Organisation & {
  summaryListRows: OrganisationWithOfferingEmailSummaryListRows
}

export type {
  CoursePresenter,
  ObjectWithHtmlString,
  ObjectWithTextString,
  OrganisationWithOfferingEmailPresenter,
  OrganisationWithOfferingEmailSummaryListRows,
  OrganisationWithOfferingId,
  SummaryListRow,
  TableRow,
  Tag,
  TagColour,
}
