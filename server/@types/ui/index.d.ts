import type {
  Course,
  CourseOffering,
  CourseParticipation,
  Organisation,
  Person,
  Referral,
  RiskLevel,
} from '@accredited-programmes/models'
import type {
  GovukFrontendPagination,
  GovukFrontendPaginationItem,
  GovukFrontendRadiosItem,
  GovukFrontendSummaryList,
  GovukFrontendSummaryListCardActions,
  GovukFrontendSummaryListCardActionsItem,
  GovukFrontendSummaryListRow,
  GovukFrontendSummaryListRowKey,
  GovukFrontendSummaryListRowValue,
  GovukFrontendTag,
} from '@govuk-frontend'
import type { OffenceDto, OffenceHistoryDetail } from '@prison-api'

type GovukFrontendRadiosItemWithLabel = GovukFrontendRadiosItem & { label: string }

type GovukFrontendSummaryListCardActionsItemWithText = GovukFrontendSummaryListCardActionsItem & { text: string }

type GovukFrontendSummaryListCardActionsWithItems = GovukFrontendSummaryListCardActions & {
  items: Array<GovukFrontendSummaryListCardActionsItem>
}

type GovukFrontendSummaryListRowWithKeyAndValue = GovukFrontendSummaryListRow & {
  key: GovukFrontendSummaryListRowKey
  value: GovukFrontendSummaryListRowValue
}

type GovukFrontendSummaryListWithRowsWithKeysAndValues = GovukFrontendSummaryList & {
  rows: Array<GovukFrontendSummaryListRowWithKeyAndValue>
}

type GovukFrontendTagWithText = GovukFrontendTag & { text: string }

type GovukFrontendPaginationWithItems = GovukFrontendPagination & { items: Array<GovukFrontendPaginationItem> }

type HasTextString = {
  text: string
}

type HasHtmlString = {
  html: string
}

type TagColour = 'blue' | 'green' | 'grey' | 'orange' | 'pink' | 'purple' | 'red' | 'turquoise' | 'yellow'

type CaseListColumnHeader =
  | 'Conditional release date'
  | 'Date referred'
  | 'Earliest release date'
  | 'Name / Prison number'
  | 'Parole eligibility date'
  | 'Programme location'
  | 'Programme name'
  | 'Programme strand'
  | 'Progress'
  | 'Referral status'
  | 'Release date type'
  | 'Tariff end date'

type CourseParticipationPresenter = CourseParticipation & {
  addedByDisplayName: string
}

type CoursePresenter = Course & {
  audienceTag: GovukFrontendTagWithText
  nameAndAlternateName: string
  prerequisiteSummaryListRows: Array<GovukFrontendSummaryListRowWithKeyAndValue>
}

type OffenceDetails = {
  code?: OffenceHistoryDetail['offenceCode']
  date?: OffenceHistoryDetail['offenceDate']
  description?: OffenceDto['description']
  mostSerious?: OffenceHistoryDetail['mostSerious']
  statuteCodeDescription?: OffenceDto['statuteCode']['description']
}

type OffenceHistory = {
  additionalOffences: Array<OffenceDetails>
  indexOffence?: OffenceDetails
}

type OrganisationWithOfferingId = Organisation & {
  courseOfferingId: CourseOffering['id']
}

type OrganisationWithOfferingEmailsPresenter = Organisation & {
  summaryListRows: Array<GovukFrontendSummaryListRowWithKeyAndValue>
}

type ReferralSharedPageData = {
  courseOfferingSummaryListRows: Array<GovukFrontendSummaryListRowWithKeyAndValue>
  navigationItems: Array<MojFrontendNavigationItem>
  pageHeading: string
  pageSubHeading: string
  person: Person
  referral: Referral
  submissionSummaryListRows: Array<GovukFrontendSummaryListRowWithKeyAndValue>
  subNavigationItems: Array<MojFrontendNavigationItem>
}

type ReferralStatusGroup = 'closed' | 'draft' | 'open'

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

type RisksAndNeedsSharedPageData = {
  navigationItems: Array<MojFrontendNavigationItem>
  pageHeading: string
  pageSubHeading: string
  person: Person
  referral: Referral
  subNavigationItems: Array<MojFrontendNavigationItem>
}

type ReferralTaskListSection = {
  heading: string
  items: Array<ReferralTaskListItem>
}

type MojFrontendNavigationItem = {
  active: boolean
  href: string
  text: string
}

type QueryParam = {
  key: string
  value: string
}

type OspBox = {
  dataTestId: string
  levelClass: string
  levelText: string
  type: 'OSP/C' | 'OSP/I'
}

type RiskBox = {
  category: 'OGRS Year 1' | 'OGRS Year 2' | 'OVP Year 1' | 'OVP Year 2' | 'RoSH' | 'RSR' | 'SARA'
  dataTestId: string
  levelClass: string
  levelText: string
  bodyHtml?: string
  figure?: string
}

type RiskLevelOrUnknown = RiskLevel | 'UNKNOWN'

export type {
  CaseListColumnHeader,
  CourseParticipationPresenter,
  CoursePresenter,
  GovukFrontendPaginationWithItems,
  GovukFrontendRadiosItemWithLabel,
  GovukFrontendSummaryListCardActionsItemWithText,
  GovukFrontendSummaryListCardActionsWithItems,
  GovukFrontendSummaryListRowWithKeyAndValue,
  GovukFrontendSummaryListWithRowsWithKeysAndValues,
  GovukFrontendTagWithText,
  HasHtmlString,
  HasTextString,
  MojFrontendNavigationItem,
  OffenceDetails,
  OffenceHistory,
  OrganisationWithOfferingEmailsPresenter,
  OrganisationWithOfferingId,
  OspBox,
  QueryParam,
  ReferralSharedPageData,
  ReferralStatusGroup,
  ReferralTaskListItem,
  ReferralTaskListSection,
  ReferralTaskListStatusTag,
  ReferralTaskListStatusText,
  RiskBox,
  RiskLevelOrUnknown,
  RisksAndNeedsSharedPageData,
  TagColour,
}
