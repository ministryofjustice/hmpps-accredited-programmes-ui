import type { Organisation, Person, RiskLevel } from '@accredited-programmes/models'
import type {
  Course,
  CourseOffering,
  CourseParticipation,
  PeopleSearchResponse,
  PniScore,
  Referral,
  ReferralStatusHistory,
} from '@accredited-programmes-api'
import type {
  GovukFrontendButton,
  GovukFrontendPagination,
  GovukFrontendPaginationItem,
  GovukFrontendSummaryList,
  GovukFrontendSummaryListCardActions,
  GovukFrontendSummaryListCardActionsItem,
  GovukFrontendSummaryListRow,
  GovukFrontendSummaryListRowKey,
  GovukFrontendSummaryListRowValue,
  GovukFrontendTag,
} from '@govuk-frontend'
import type { OffenceDto, OffenceHistoryDetail } from '@prison-api'

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

type TagColour =
  | 'blue'
  | 'green'
  | 'grey'
  | 'light-blue'
  | 'orange'
  | 'pink'
  | 'purple'
  | 'red'
  | 'turquoise'
  | 'yellow'

type CaseListColumnHeader =
  | 'Date referred'
  | 'Earliest release date'
  | 'Location'
  | 'Name and prison number'
  | 'Programme location'
  | 'Programme name'
  | 'Programme strand'
  | 'Progress'
  | 'Referral status'
  | 'Sentence type'

type CourseParticipationPresenter = CourseParticipation & {
  addedByDisplayName: string
}

type CoursePresenter = Course & {
  audienceTag: GovukFrontendTagWithText
  href: string
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
  buttons: Array<GovukFrontendButton>
  course: Course
  courseOffering: CourseOffering
  courseOfferingSummaryListRows: Array<GovukFrontendSummaryListRowWithKeyAndValue>
  hideTitleServiceName: boolean
  navigationItems: Array<MojFrontendNavigationItem>
  organisation: Organisation
  pageHeading: string
  pageSubHeading: string
  pageTitleOverride: string
  person: Person
  referral: Referral
  submissionSummaryListRows: Array<GovukFrontendSummaryListRowWithKeyAndValue>
  subNavigationItems: Array<MojFrontendNavigationItem>
}

type ReferralTaskListStatusText = 'Cannot start yet' | 'Completed' | 'Not started'

type ReferralTaskListStatusTagCompleted = GovukFrontendTagWithText & {
  classes: 'govuk-tag--grey moj-task-list__task-completed'
  text: 'Cannot start yet'
}

type ReferralTaskListStatusTagNotStarted = GovukFrontendTagWithText & {
  classes: 'govuk-tag--grey moj-task-list__task-completed'
  text: 'Not started'
}

type ReferralTaskListStatusTagCannotStartYet = GovukFrontendTagWithText & {
  classes: 'moj-task-list__task-completed'
  text: 'Completed'
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
  buttons: Array<GovukFrontendButton>
  navigationItems: Array<MojFrontendNavigationItem>
  pageHeading: string
  pageSubHeading: string
  person: Person
  referral: Referral
  subNavigationItems: Array<MojFrontendNavigationItem>
  hideTitleServiceName?: boolean
  pageTitleOverride?: string
  recentCompletedAssessmentDate?: string
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

type SortableCaseListColumnKey =
  | 'audience'
  | 'earliestReleaseDate'
  | 'listDisplayName'
  | 'location'
  | 'organisationName'
  | 'sentenceType'
  | 'status'
  | 'submittedOn'
  | 'surname'

type HtmlOrText = { html: string } | { text: string }

type MojTimelineItem = HtmlOrText & {
  byline: {
    text: string
  }
  datetime: {
    timestamp: string
    type?: 'date' | 'datetime' | 'shortdate' | 'shortdatetime' | 'time'
  }
  label: HtmlOrText
}

type ReferralStatusHistoryPresenter = ReferralStatusHistory & {
  byLineText: MojTimelineItem['byline']['text']
}

interface BuildingChoicesData {
  courseVariantId: Course['id']
  isConvictedOfSexualOffence: string
  isInAWomensPrison: string
}

interface PniFindAndReferData {
  prisonNumber?: PeopleSearchResponse['prisonerNumber']
  programmePathway?: PniScore['programmePathway']
}

interface TransferErrorData {
  errorMessage: string
  originalOfferingId: string
  prisonNumber: string
  duplicateReferralId?: string
  originalReferralId?: string
}

export type {
  BuildingChoicesData,
  CaseListColumnHeader,
  CourseParticipationPresenter,
  CoursePresenter,
  GovukFrontendPaginationWithItems,
  GovukFrontendSummaryListCardActionsItemWithText,
  GovukFrontendSummaryListCardActionsWithItems,
  GovukFrontendSummaryListRowWithKeyAndValue,
  GovukFrontendSummaryListWithRowsWithKeysAndValues,
  GovukFrontendTagWithText,
  HasHtmlString,
  HasTextString,
  MojFrontendNavigationItem,
  MojTimelineItem,
  OffenceDetails,
  OffenceHistory,
  OrganisationWithOfferingEmailsPresenter,
  OrganisationWithOfferingId,
  OspBox,
  PniFindAndReferData,
  QueryParam,
  ReferralSharedPageData,
  ReferralStatusHistoryPresenter,
  ReferralTaskListItem,
  ReferralTaskListSection,
  ReferralTaskListStatusTag,
  ReferralTaskListStatusText,
  RiskBox,
  RiskLevelOrUnknown,
  RisksAndNeedsSharedPageData,
  SortableCaseListColumnKey,
  TagColour,
  TransferErrorData,
}
