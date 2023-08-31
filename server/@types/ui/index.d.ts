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

type ReferralTaskListStatusText = 'completed' | 'not started' | 'cannot start yet'

// these are `GovukFrontendTag`s with spefic values
type ReferralTaskListStatusTag =
  | { classes: 'govuk-tag moj-task-list__task-completed'; text: 'completed' }
  | { classes: 'govuk-tag govuk-tag--grey moj-task-list__task-completed'; text: 'not started' }
  | { classes: 'govuk-tag govuk-tag--grey moj-task-list__task-completed'; text: 'cannot start yet' }

type ReferralTaskListItem = {
  statusTag: ReferralTaskListStatusTag
  text: string
  url?: string
}

type ReferralTaskListSection = {
  heading: string
  items: Array<ReferralTaskListItem>
}

export type {
  CoursePresenter,
  GovukFrontendSummaryListRowWithValue,
  HasHtmlString,
  HasTextString,
  OrganisationWithOfferingEmailsPresenter,
  OrganisationWithOfferingEmailsSummaryListRows,
  OrganisationWithOfferingId,
  ReferralTaskListSection,
  ReferralTaskListStatusTag,
  ReferralTaskListStatusText,
  TagColour,
}
