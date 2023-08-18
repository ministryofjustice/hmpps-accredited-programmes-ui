import type { GovukFrontendSummaryListRow } from '../govukFrontend'
import type { Course, CourseOffering, Organisation } from '@accredited-programmes/models'

type GovukFrontendSummaryListRowWithValue = GovukFrontendSummaryListRow & { value: GovukFrontendSummaryListRowValue }

type HasTextString = {
  text: string
}

type HasHtmlString = {
  html: string
}

type TagColour = 'blue' | 'green' | 'grey' | 'orange' | 'pink' | 'purple' | 'red' | 'turquoise' | 'yellow'

type CoursePresenter = Course & {
  audienceTags: Array<Tag>
  nameAndAlternateName: string
  prerequisiteSummaryListRows: Array<GovukFrontendSummaryListRowWithValue>
}

type OrganisationWithOfferingId = Organisation & {
  courseOfferingId: CourseOffering['id']
}

type OrganisationWithOfferingEmailsPresenter = Organisation & {
  summaryListRows: Array<GovukFrontendSummaryListRowWithValue>
}

export type {
  CoursePresenter,
  GovukFrontendSummaryListRowWithValue,
  HasHtmlString,
  HasTextString,
  OrganisationWithOfferingEmailsPresenter,
  OrganisationWithOfferingEmailsSummaryListRows,
  OrganisationWithOfferingId,
  TagColour,
}
