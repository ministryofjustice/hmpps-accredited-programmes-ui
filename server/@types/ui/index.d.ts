import type { GovukFrontendSummaryListRow } from '../govukFrontend'
import type { Course, CourseOffering, Organisation } from '@accredited-programmes/models'

type HasTextString = {
  text: string
}

type HasHtmlString = {
  html: string
}

type TagColour = 'blue' | 'green' | 'grey' | 'orange' | 'pink' | 'purple' | 'red' | 'turquoise' | 'yellow'

type CoursePresenter = Course & {
  nameAndAlternateName: string
  audienceTags: Array<Tag>
  prerequisiteSummaryListRows: Array<GovukFrontendSummaryListRow>
}

type OrganisationWithOfferingId = Organisation & {
  courseOfferingId: CourseOffering['id']
}

type OrganisationWithOfferingEmailsPresenter = Organisation & {
  summaryListRows: Array<GovukFrontendSummaryListRow>
}

export type {
  CoursePresenter,
  HasHtmlString,
  HasTextString,
  OrganisationWithOfferingEmailsPresenter,
  OrganisationWithOfferingEmailsSummaryListRows,
  OrganisationWithOfferingId,
  TagColour,
}
