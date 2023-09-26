import type {
  GovukFrontendSummaryList,
  GovukFrontendSummaryListRow,
  GovukFrontendSummaryListRowValue,
  GovukFrontendTag,
} from '../govukFrontend'
import type { Course, CourseOffering, Organisation } from '@accredited-programmes/models'

type GovukFrontendSummaryListRowWithValue = GovukFrontendSummaryListRow & { value: GovukFrontendSummaryListRowValue }

type GovukFrontendSummaryListWithRowsWithValues = GovukFrontendSummaryList & {
  rows: Array<GovukFrontendSummaryListRowWithValue>
}

type GovukFrontendTagWithText = GovukFrontendTag & { text: string }

type HasTextString = {
  text: string
}

type HasHtmlString = {
  html: string
}

type TagColour = 'blue' | 'green' | 'grey' | 'orange' | 'pink' | 'purple' | 'red' | 'turquoise' | 'yellow'

type CoursePresenter = Course & {
  audienceTags: Array<GovukFrontendTagWithText>
  nameAndAlternateName: string
  prerequisiteSummaryListRows: Array<GovukFrontendSummaryListRowWithValue>
}

type OrganisationWithOfferingId = Organisation & {
  courseOfferingId: CourseOffering['id']
}

type OrganisationWithOfferingEmailsPresenter = Organisation & {
  summaryListRows: Array<GovukFrontendSummaryListRowWithValue>
}

type ReferralTaskListStatusText = 'cannot start yet' | 'completed' | 'not started'

type ReferralTaskListStatusTagCompleted = GovukFrontendTagWithText & {
  classes: 'govuk-tag--grey moj-task-list__task-completed'
  text: 'cannot start yet'
}

type ReferralTaskListStatusTagNotStarted = GovukFrontendTagWithText & {
  classes: 'govuk-tag--grey moj-task-list__task-completed'
  text: 'not started'
}

type ReferralTaskListStatusTagCannotStartYet = GovukFrontendTagWithText & {
  classes: 'moj-task-list__task-completed'
  text: 'completed'
}

type ReferralTaskListStatusTag =
  | ReferralTaskListStatusTagCannotStartYet
  | ReferralTaskListStatusTagCompleted
  | ReferralTaskListStatusTagNotStarted

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
  GovukFrontendSummaryListWithRowsWithValues,
  GovukFrontendTagWithText,
  HasHtmlString,
  HasTextString,
  OrganisationWithOfferingEmailsPresenter,
  OrganisationWithOfferingId,
  ReferralTaskListItem,
  ReferralTaskListSection,
  ReferralTaskListStatusTag,
  ReferralTaskListStatusText,
  TagColour,
}
