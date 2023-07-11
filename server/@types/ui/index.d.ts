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

type OrganisationWithOfferingEmailsSummaryListRows = [
  SummaryListRow<'Address', ObjectWithTextString>,
  SummaryListRow<'County', ObjectWithTextString>,
  SummaryListRow<'Email address', ObjectWithHtmlString>,
  SummaryListRow<'Secondary email address', ObjectWithHtmlString>?,
]

type OrganisationWithOfferingEmailsPresenter = Organisation & {
  summaryListRows: OrganisationWithOfferingEmailsSummaryListRows
}

export type {
  CoursePresenter,
  ObjectWithHtmlString,
  ObjectWithTextString,
  OrganisationWithOfferingEmailsPresenter,
  OrganisationWithOfferingEmailsSummaryListRows,
  OrganisationWithOfferingId,
  SummaryListRow,
  TableRow,
  Tag,
  TagColour,
}
