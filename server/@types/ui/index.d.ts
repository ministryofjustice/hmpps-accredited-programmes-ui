import type { Course, CourseOffering, CourseParticipation, Organisation } from '@accredited-programmes/models'
import type {
  GovukFrontendRadiosItem,
  GovukFrontendSummaryList,
  GovukFrontendSummaryListCardActions,
  GovukFrontendSummaryListCardActionsItem,
  GovukFrontendSummaryListRow,
  GovukFrontendSummaryListRowValue,
  GovukFrontendTag,
} from '@govuk-frontend'

type GovukFrontendRadiosItemWithLabel = GovukFrontendRadiosItem & { label: string }

type GovukFrontendSummaryListCardActionsItemWithText = GovukFrontendSummaryListCardActionsItem & { text: string }

type GovukFrontendSummaryListCardActionsWithItems = GovukFrontendSummaryListCardActions & {
  items: Array<GovukFrontendSummaryListCardActionsItem>
}

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

type CourseParticipationPresenter = CourseParticipation & {
  addedByDisplayName: string
}

type CoursePresenter = Course & {
  audienceTags: Array<GovukFrontendTagWithText>
  nameAndAlternateName: string
  prerequisiteSummaryListRows: Array<GovukFrontendSummaryListRowWithValue>
}

type OffenceWithDetail = {
  category: string
  description: string
  mostSerious: boolean
  offenceCode: string
  offenceDate: string
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

type MojFrontendSideNavigationItem = {
  active: boolean
  href: string
  text: string
}

export type {
  CourseParticipationPresenter,
  CoursePresenter,
  GovukFrontendRadiosItemWithLabel,
  GovukFrontendSummaryListCardActionsItemWithText,
  GovukFrontendSummaryListCardActionsWithItems,
  GovukFrontendSummaryListRowWithValue,
  GovukFrontendSummaryListWithRowsWithValues,
  GovukFrontendTagWithText,
  HasHtmlString,
  HasTextString,
  MojFrontendSideNavigationItem,
  OffenceWithDetail,
  OrganisationWithOfferingEmailsPresenter,
  OrganisationWithOfferingId,
  ReferralTaskListItem,
  ReferralTaskListSection,
  ReferralTaskListStatusTag,
  ReferralTaskListStatusText,
  TagColour,
}
