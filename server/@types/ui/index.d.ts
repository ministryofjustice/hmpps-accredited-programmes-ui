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

type ReferralTaskListStatusTag =
  | (GovukFrontendTag & { classes: 'moj-task-list__task-completed'; text: 'completed' })
  | (GovukFrontendTag & { classes: 'govuk-tag--grey moj-task-list__task-completed'; text: 'not started' })
  | (GovukFrontendTag & { classes: 'govuk-tag--grey moj-task-list__task-completed'; text: 'cannot start yet' })

type ReferralTaskListItemTestIds = {
  listItem: string
}

type ReferralTaskListItem = {
  statusTag: ReferralTaskListStatusTag
  text: string
  testIds?: ReferralTaskListItemTestIds
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
  ReferralTaskListItem,
  ReferralTaskListSection,
  ReferralTaskListStatusTag,
  ReferralTaskListStatusText,
  TagColour,
}
