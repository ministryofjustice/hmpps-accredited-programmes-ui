/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface ErrorResponse {
  /**
   * @format int32
   * @example 404
   */
  status: number
  /**
   * @format int32
   * @example null
   */
  errorCode?: number
  /** @example "Not found" */
  userMessage?: string
  /** @example null */
  developerMessage?: string
  /** @example null */
  moreInfo?: string
}

export interface ReferralUpdate {
  /** @example null */
  oasysConfirmed: boolean
  /** @example null */
  hasReviewedProgrammeHistory: boolean
  /** @example null */
  additionalInformation?: string
  /**
   * Reason for overriding the recommended course
   * @example "The reason for going with the recommended course is..."
   */
  overrideReason?: string
  /**
   * Flag to indicate if the person has a Learning Difficulty Challenges
   * @example true
   */
  hasLdc?: boolean
  /**
   * Flag to indicate if the ldc field was overriden by the programme team
   * @example true
   */
  hasLdcBeenOverriddenByProgrammeTeam?: boolean
}

export interface ReferralStatusUpdate {
  /** @example "ON_HOLD_REFERRAL_SUBMITTED" */
  status: string
  /** @example "W_ADMIN" */
  category?: string
  /** @example "Duplicate referral" */
  reason?: string
  /** @example "E2E test put on hold reason" */
  notes?: string
  /**
   * is the user a pt user
   * @example false
   */
  ptUser?: boolean
}

export interface RetryDlqResult {
  /** @format int32 */
  messagesFoundCount: number
}

export interface PurgeQueueResult {
  /** @format int32 */
  messagesFoundCount: number
}

export interface Course {
  /**
   * @format uuid
   * @example null
   */
  id: string
  /** @example "Thinking skills programme" */
  name: string
  /** @example null */
  coursePrerequisites: CoursePrerequisite[]
  /** @example "Gang offence" */
  audience: string
  /**
   * This is an internal identifier for the course (to be removed)
   * @example "BNM-VO"
   */
  identifier?: string
  /** @example "Thinking Skills Programme (TSP) description" */
  description?: string
  /** @example "BNM+" */
  alternateName?: string
  /** @example "Becoming New Me Plus: general violence offence (BNM+)" */
  displayName?: string
  /** @example "purple" */
  audienceColour?: string
  /** @example true */
  withdrawn?: boolean
  /** @example true */
  displayOnProgrammeDirectory?: boolean
  /**
   * Intensity of the course
   * @example true
   */
  intensity?: string
  /**
   * List of offerings for the course
   * @example null
   */
  courseOfferings: CourseOffering[]
}

export interface CourseOffering {
  /**
   * The unique identifier associated with the location hosting the offering. For prisons, this is the PrisonId, which is usually three capital letters.
   * @example "MDI"
   */
  organisationId: string
  /**
   * The email address of a contact for this offering
   * @example "ap-admin@digital.justice.gov.uk"
   */
  contactEmail: string
  /** @example null */
  referable: boolean
  /**
   * @format uuid
   * @example null
   */
  id?: string
  /**
   * Describes if a referral can be created with an organisation
   * @example null
   */
  organisationEnabled?: boolean
  /**
   * An optional secondary email address of a contact for this offering.
   * @example "ap-admin-2@digital.justice.gov.uk"
   */
  secondaryContactEmail?: string
  /** @example null */
  withdrawn?: boolean
  /**
   * Gender for which course is offered
   * @example "M"
   */
  gender?: 'MALE' | 'FEMALE'
}

export interface CoursePrerequisite {
  /** @example null */
  name: string
  /** @example null */
  description: string
}

export interface CourseUpdateRequest {
  /** @example "Thinking skills programme" */
  name?: string
  /** @example "Thinking Skills Programme (TSP) description" */
  description?: string
  /** @example "BNM+" */
  alternateName?: string
  /** @example "Becoming New Me Plus: general violence offence (BNM+)" */
  displayName?: string
  /** @example "Gang offence" */
  audience?: string
  /** @example "#FF5733" */
  audienceColour?: string
  /** @example true */
  withdrawn?: boolean
}

export interface CoursePrerequisites {
  /** @example null */
  prerequisites?: CoursePrerequisite[]
}

export interface CourseParticipation {
  /**
   * The prison number of the course participant.
   * @example "A1234AA"
   */
  prisonNumber: string
  /**
   * A unique identifier for this record of participation in a course.
   * @format uuid
   * @example null
   */
  id: string
  /**
   * The unique identifier for the associated referral.
   * @format uuid
   * @example null
   */
  referralId: string
  /**
   * The identity of the person who added this CourseParticipation
   * @example null
   */
  addedBy: string
  /**
   * The date and time at which this CourseParticipation was created. ISO 8601 date-time format.
   * @example null
   */
  createdAt: string
  /**
   * The name of the course taken by the participant.
   * @example null
   */
  courseName?: string
  /** @example null */
  setting?: CourseParticipationSetting
  /** @example null */
  outcome?: CourseParticipationOutcome
  /** @example null */
  detail?: string
  /** @example null */
  source?: string
  /**
   * Whether this is a draft record or not.
   * @example null
   */
  isDraft?: boolean
  /**
   * The status of the associated referral.
   * @example null
   */
  referralStatus?: string
}

export interface CourseParticipationOutcome {
  /** @example null */
  status: 'incomplete' | 'complete'
  /**
   * @format int32
   * @example null
   */
  yearStarted?: number
  /**
   * @format int32
   * @example null
   */
  yearCompleted?: number
}

export interface CourseParticipationSetting {
  /** @example null */
  type: 'custody' | 'community'
  /** @example null */
  location?: string
}

export interface CourseParticipationUpdate {
  /**
   * The name of the course taken by the participant.
   * @example null
   */
  courseName?: string
  /** @example null */
  setting?: CourseParticipationSetting
  /** @example null */
  outcome?: CourseParticipationOutcome
  /** @example null */
  detail?: string
  /** @example null */
  source?: string
}

export interface ReferralCreated {
  /**
   * The unique id (UUID) of the new referral.
   * @format uuid
   * @example null
   */
  referralId: string
}

export interface CourseEntity {
  /** @format uuid */
  id?: string
  /** @format int64 */
  version: number
  name: string
  identifier: string
  description?: string
  alternateName?: string
  /** @uniqueItems true */
  prerequisites: PrerequisiteEntity[]
  /** @uniqueItems true */
  offerings: OfferingEntity[]
  audience: string
  audienceColour?: string
  withdrawn: boolean
  listDisplayName?: string
  displayOnProgrammeDirectory?: boolean
  intensity?: string
}

export interface OfferingEntity {
  /** @format uuid */
  id?: string
  /** @format int64 */
  version: number
  organisationId: string
  contactEmail: string
  secondaryContactEmail?: string
  withdrawn: boolean
  referable: boolean
  course: CourseEntity
}

export interface PrerequisiteEntity {
  name: string
  description: string
}

export interface ReferralEntity {
  /** @format uuid */
  id?: string
  /** @format int64 */
  version: number
  offering: OfferingEntity
  prisonNumber: string
  referrer: ReferrerUserEntity
  additionalInformation?: string
  oasysConfirmed: boolean
  hasReviewedProgrammeHistory: boolean
  status: string
  /** @example "2025-03-26T13:53:14" */
  submittedOn?: any
  deleted: boolean
  primaryPomStaffId?: number
  secondaryPomStaffId?: number
  overrideReason?: string
  /** @format uuid */
  originalReferralId?: string
  hasLdc?: boolean
  hasLdcBeenOverriddenByProgrammeTeam: boolean
}

export interface ReferrerUserEntity {
  username: string
}

export interface ReferralCreate {
  /**
   * The id (UUID) of an active offering
   * @format uuid
   * @example null
   */
  offeringId: string
  /**
   * The prison number of the person who is being referred.
   * @example "A1234AA"
   */
  prisonNumber: string
  /**
   * Referral ID of the original referral from which transfer was initiated
   * @format uuid
   * @example "44e3cdab-c996-4234-afe5-a9d8ddb13be8"
   */
  originalReferralId?: string
}

export interface Referral {
  /**
   * The id (UUID) of an active offering
   * @format uuid
   * @example null
   */
  offeringId: string
  /**
   * The prison number of the person who is being referred.
   * @example "A1234AA"
   */
  prisonNumber: string
  /** @example null */
  oasysConfirmed: boolean
  /** @example null */
  hasReviewedProgrammeHistory: boolean
  /**
   * The unique id (UUID) of this referral.
   * @format uuid
   * @example null
   */
  id: string
  /**
   * The status code of the referral.
   * @example null
   */
  status: string
  /** @example null */
  referrerUsername: string
  /** @example null */
  additionalInformation?: string
  /**
   * Is the status of the referral a closed one.
   * @example null
   */
  closed?: boolean
  /**
   * The status description.
   * @example null
   */
  statusDescription?: string
  /**
   * The colour to display status description.
   * @example null
   */
  statusColour?: string
  /** @example null */
  submittedOn?: string
  /**
   * Reason for overriding the recommended course
   * @example "The reason for going with the recommended course is..."
   */
  overrideReason?: string
  /**
   * Referral ID of the original referral from which transfer was initiated
   * @format uuid
   * @example "44e3cdab-c996-4234-afe5-a9d8ddb13be8"
   */
  originalReferralId?: string
  /**
   * Flag to indicate learning difficulties and challenges
   * @example true
   */
  hasLdc?: boolean
  /**
   * Flag to indicate if the ldc field was overridden by the programme team
   * @example true
   */
  hasLdcBeenOverriddenByProgrammeTeam: boolean
  /** @example null */
  primaryPrisonOffenderManager?: StaffDetail
}

export interface StaffDetail {
  staffId?: number
  firstName: string
  lastName: string
  primaryEmail?: string
  username: string
  accountType: 'GENERAL' | 'ADMIN'
}

/** Details needed to transfer a referral to Building Choices */
export interface TransferReferralRequest {
  /**
   * Referral ID of the referral from which transfer was initiated
   * @format uuid
   * @example "44e3cdab-c996-4234-afe5-a9d8ddb13be8"
   */
  referralId: string
  /**
   * The id (UUID) of an active offering
   * @format uuid
   * @example "44e3cdab-c996-4234-afe5-a9d8ddb13be9"
   */
  offeringId: string
  /**
   * Reason for transfer of referral to building choices
   * @example "The reason for tranferring the referal is"
   */
  transferReason: string
}

export interface PeopleSearchResponse {
  /** @example null */
  bookingId: string
  /** @example null */
  prisonerNumber: string
  /**
   * @format date
   * @example null
   */
  conditionalReleaseDate?: string
  /**
   * ID of the prison
   * @example "MDI"
   */
  prisonId?: string
  /** @example "HMP Leeds" */
  prisonName?: string
  /**
   * @format date
   * @example null
   */
  dateOfBirth?: string
  /** @example null */
  ethnicity?: string
  /** @example null */
  gender?: string
  /**
   * @format date
   * @example null
   */
  homeDetentionCurfewEligibilityDate?: string
  /** @example null */
  indeterminateSentence?: boolean
  /** @example null */
  firstName?: string
  /** @example null */
  lastName?: string
  /**
   * @format date
   * @example null
   */
  paroleEligibilityDate?: string
  /** @example null */
  religion?: string
  /**
   * @format date
   * @example null
   */
  sentenceExpiryDate?: string
  /**
   * @format date
   * @example null
   */
  sentenceStartDate?: string
  /**
   * @format date
   * @example null
   */
  tariffDate?: string
}

export interface PeopleSearchRequest {
  /**
   * Prisoner identifier for this case we only accept prison number
   * @example "A1234AA"
   */
  prisonerIdentifier: string
  /**
   * List of Prison Ids (can include OUT and TRN) to restrict the search by. Unrestricted if not supplied or null
   * @example ["MDI"]
   */
  prisonIds?: string[]
}

export interface Address {
  /** @example "Higher Lane" */
  addressLine1: string
  /** @example "Liverpool" */
  town: string
  /** @example "L9 7LH" */
  postcode: string
  /** @example "England" */
  country: string
  /** @example null */
  addressLine2?: string
  /** @example "Merseyside" */
  county?: string
}

export interface Category {
  /** @example "E" */
  category: string
}

export interface PrisonOperator {
  /** @example "PSP, G4S" */
  name: string
}

export interface PrisonSearchResponse {
  /** @example null */
  prisonId?: string
  /** @example null */
  prisonName?: string
  /** @example null */
  active?: boolean
  /** @example null */
  male?: boolean
  /** @example null */
  female?: boolean
  /** @example null */
  contracted?: boolean
  /** @example null */
  types?: PrisonType[]
  /** @example null */
  categories?: Category[]
  /** @example null */
  addresses?: Address[]
  /** @example null */
  operators?: PrisonOperator[]
}

export interface PrisonType {
  /** @example "YOI" */
  code: string
  /** @example "His Majesty’s Youth Offender Institution" */
  description: string
}

export interface PrisonSearchRequest {
  /**
   * List of Prisons
   * @example ["MDI"]
   */
  prisonIds: string[]
}

export interface CourseCreateRequest {
  /** @example "Thinking skills programme" */
  name: string
  /** @example "Thinking Skills Programme (TSP) description" */
  description: string
  /**
   * @format uuid
   * @example "e4d1a44a-9c3b-4a7c-b79c-4d8a76488eb2"
   */
  audienceId: string
  /** @example true */
  withdrawn: boolean
  /**
   * This is an internal identifier for the course (to be removed)
   * @example "BNM-VO"
   */
  identifier?: string
  /** @example "BNM+" */
  alternateName?: string
  /**
   * flag is used to display course on the find dir
   * @example true
   */
  displayOnProgrammeDirectory: boolean
  /**
   * Intensity of the course
   * @example "HIGH MODERATE"
   */
  intensity?: string
}

export interface BuildingChoicesSearchRequest {
  /**
   * Have they been convicted of a sexual offence?
   * @example true
   */
  isConvictedOfSexualOffence: boolean
  /**
   * Are they in a women's prison?
   * @example true
   */
  isInAWomensPrison: boolean
}

export interface CourseParticipationCreate {
  /**
   * The prison number of the course participant.
   * @example "A1234AA"
   */
  prisonNumber: string
  /**
   * The name of the course taken by the participant.
   * @example null
   */
  courseName?: string
  /** @example null */
  setting?: CourseParticipationSetting
  /** @example null */
  outcome?: CourseParticipationOutcome
  /** @example null */
  detail?: string
  /** @example null */
  source?: string
  /**
   * The unique id (UUID) of the associated referral.
   * @format uuid
   * @example null
   */
  referralId?: string
  /**
   * Whether this is a draft record or not.
   * @example null
   */
  isDraft?: boolean
}

export interface PrisonNumberRequest {
  /**
   * List of prison numbers for which comparison needs to be checked
   * @example null
   */
  prisonNumbers: string[]
}

export interface CaseLoad {
  /**
   * The unique identifier of the caseload.
   * @example null
   */
  caseLoadId?: string
  /**
   * The description of the caseload.
   * @example null
   */
  description?: string
  /**
   * The type of the caseload.
   * @example null
   */
  type?: string
  /**
   * The function of the caseload.
   * @example null
   */
  caseloadFunction?: string
  /**
   * Indicates whether the caseload is currently active or not.
   * @example null
   */
  currentlyActive?: boolean
}

/** The result of the statistics query */
export interface Content {
  /**
   * count will be present for simple queries where there is only a count returned.
   * @format int32
   */
  count?: number
  /** A list of counts will be returned when the query has more than one count returned */
  courseCounts?: CourseCount[]
}

export interface CourseCount {
  name: string
  audience: string
  /** @format int32 */
  count?: number
}

export interface Parameters {
  /** @format date */
  startDate: string
  /** @format date */
  endDate?: string
  locationCodes?: string[]
  /** @format uuid */
  courseId?: string
}

export interface ReportContent {
  reportType: string
  parameters: Parameters
  /** The result of the statistics query */
  content: Content
}

export interface ReferralStatistics {
  submittedReferralCount: number
  draftReferralCount: number
  averageDuration: string
}

export interface ReportStatusCountProjection {
  orgId: string
  count: number
  status: string
}

export interface StatusCountByProgramme {
  courseName: string
  audience: string
  count: number
  status: string
  organisationCode: string
}

export interface ReportTypes {
  types: string[]
}

export interface Performance {
  performance?: PerformanceStatistic[]
}

export interface PerformanceStatistic {
  status: string
  averageDuration?: string
  minDuration?: string
  maxDuration?: string
}

export interface CurrentCount {
  /** @format int32 */
  totalCount?: number
  statusContent?: StatusContent[]
}

export interface StatusContent {
  status: string
  /** @format int32 */
  countAtStatus: number
  courseCounts?: CourseCount[]
}

export interface ReferralStatusRefData {
  /** @example "WITHDRAWN" */
  code: string
  /** @example "Withdrawn" */
  description: string
  /** @example "light-grey" */
  colour: string
  /** @example "The application has been withdrawn" */
  hintText?: string
  /** @example "I confirm that this person is eligible." */
  confirmationText?: string
  /**
   * flag to show this status has notes text box
   * @example null
   */
  hasNotes?: boolean
  /**
   * flag to show this status has confirmation box
   * @example null
   */
  hasConfirmation?: boolean
  /**
   * flag to show this is a closed status
   * @example null
   */
  closed?: boolean
  /**
   * flag to show this is a draft status
   * @example null
   */
  draft?: boolean
  /**
   * flag to show this is a hold status
   * @example null
   */
  hold?: boolean
  /**
   * flag to show this is a release status
   * @example null
   */
  release?: boolean
  /**
   * flag to show this a bespoke status of deslected and keep open
   * @example null
   */
  deselectAndKeepOpen?: boolean
  /**
   * sort order for statuses
   * @format int32
   * @example null
   */
  defaultOrder?: number
  /**
   * flag to show whether the notes are optional
   * @example null
   */
  notesOptional?: boolean
}

export interface ReferralStatusHistory {
  /**
   * The id (UUID) of the status history record.
   * @format uuid
   * @example null
   */
  id?: string
  /**
   * The unique id (UUID) of the referral.
   * @format uuid
   * @example null
   */
  referralId?: string
  /**
   * The status of the referral.
   * @example null
   */
  status?: string
  /**
   * The status description.
   * @example null
   */
  statusDescription?: string
  /**
   * The colour to display status description.
   * @example null
   */
  statusColour?: string
  /**
   * The previous status of the referral.
   * @example null
   */
  previousStatus?: string
  /**
   * The previous status description.
   * @example null
   */
  previousStatusDescription?: string
  /**
   * The previous colour to display status description.
   * @example null
   */
  previousStatusColour?: string
  /**
   * The notes associated with the status change.
   * @example null
   */
  notes?: string
  /**
   * Date referral was changed to this status.
   * @format date-time
   * @example null
   */
  statusStartDate?: string
  /**
   * Username of the person who changed to this status
   * @example null
   */
  username?: string
  /**
   * The description of the category - if appropriate.
   * @example null
   */
  categoryDescription?: string
  /**
   * The description of the reason - if appropriate.
   * @example null
   */
  reasonDescription?: string
}

export interface ConfirmationFields {
  /** @example "Move referral to awaiting assessment" */
  primaryHeading?: string
  /** @example "Submitting this will change the status to awaiting assessment." */
  primaryDescription?: string
  /** @example "Give a reason" */
  secondaryHeading?: string
  /** @example "You must give a reason why this referral is being moved to suitable but not ready." */
  secondaryDescription?: string
  /** @example "Submitting this will pause the referral" */
  warningText?: string
  /** @example null */
  hasConfirmation?: boolean
  /** @example null */
  notesOptional?: boolean
}

export interface PaginatedReferralView {
  /** @example null */
  content?: ReferralView[]
  /**
   * @format int32
   * @example null
   */
  totalPages?: number
  /**
   * @format int32
   * @example null
   */
  totalElements?: number
  /**
   * @format int32
   * @example null
   */
  pageSize?: number
  /**
   * @format int32
   * @example null
   */
  pageNumber?: number
  /** @example null */
  pageIsEmpty?: boolean
}

export interface ReferralView {
  /**
   * The unique id (UUID) of the new referral.
   * @format uuid
   * @example null
   */
  id?: string
  /**
   * The unique HMPPS username of the user who created this referral.
   * @example null
   */
  referrerUsername?: string
  /** @example null */
  courseName?: string
  /** @example "Gang offence" */
  audience?: string
  /** @example null */
  status?: string
  /**
   * The status description.
   * @example null
   */
  statusDescription?: string
  /**
   * The colour to display status description.
   * @example null
   */
  statusColour?: string
  /**
   * Date referral was submitted.
   * @format date-time
   * @example null
   */
  submittedOn?: string
  /** @example null */
  prisonNumber?: string
  /**
   * Name of the organisation
   * @example null
   */
  organisationName?: string
  /**
   * ID of the organisation
   * @example null
   */
  organisationId?: string
  /**
   * Conditional release date.
   * @format date
   * @example null
   */
  conditionalReleaseDate?: string
  /**
   * Parole eligibility date.
   * @format date
   * @example null
   */
  paroleEligibilityDate?: string
  /**
   * Tariff expiry date.
   * @format date
   * @example null
   */
  tariffExpiryDate?: string
  /**
   * Earliest release date, if applicable, to this individual. Derived from Sentence information.
   * @format date
   * @example null
   */
  earliestReleaseDate?: string
  /**
   * Earliest release date type used
   * @example null
   */
  earliestReleaseDateType?: string
  /**
   * Release date type
   * @example null
   */
  nonDtoReleaseDateType?: string
  /**
   * forename of the person
   * @example null
   */
  forename?: string
  /**
   * surname of the person
   * @example null
   */
  surname?: string
  /**
   * Sentence type description or 'Multiple sentences' if there are more than one
   * @example null
   */
  sentenceType?: string
  /**
   * The course display name when it is in a list.
   * @example null
   */
  listDisplayName?: string
  /**
   * location of person
   * @example null
   */
  location?: string
  /**
   * Flag to indicate learning difficulties and challenges
   * @example true
   */
  hasLdc?: boolean
}

export interface ReferralStatusReason {
  /** @example "DUPLICATE" */
  code: string
  /** @example "Duplicate referral" */
  description: string
  /** @example "ADMIN" */
  referralCategoryCode: string
}

export interface ReferralStatusCategory {
  /** @example "ADMIN" */
  code: string
  /** @example "Administrative error" */
  description: string
  /** @example "WITHDRAWN" */
  referralStatusCode: string
}

export interface DlqMessage {
  body: Record<string, object>
  messageId: string
}

export interface GetDlqResult {
  /** @format int32 */
  messagesFoundCount: number
  /** @format int32 */
  messagesReturnedCount: number
  messages: DlqMessage[]
}

export interface KeyDate {
  /** @example "earliestReleaseDate" */
  type: string
  /** @example "ERD" */
  code: string
  /** @example "Earliest Release Date" */
  description?: string
  /** @example null */
  earliestReleaseDate?: boolean
  /**
   * @format date
   * @example null
   */
  date?: string
  /**
   * @format int32
   * @example null
   */
  order?: number
}

export interface Sentence {
  /** @example "CJA03 Standard Determinate Sentence" */
  description?: string
  /**
   * @format date
   * @example null
   */
  sentenceStartDate?: string
}

export interface SentenceDetails {
  /** @example null */
  sentences?: Sentence[]
  /** @example null */
  keyDates?: KeyDate[]
}

export interface Offence {
  /**
   * Description of the offence along with the code.
   * @example null
   */
  offence?: string
  /**
   * Legislation.
   * @example null
   */
  category?: string
  /**
   * Offence start date.
   * @format date
   * @example null
   */
  offenceDate?: string
}

export interface Organisation {
  /** @example "MDI" */
  code?: string
  /** @example "Moorland HMP" */
  prisonName?: string
  /**
   * The gender of inmates that a prison will accept
   * @example "MALE"
   */
  gender?: string
}

export interface EnabledOrganisation {
  /** @example "MDI" */
  code?: string
  /** @example "Stocken" */
  description?: string
}

export interface RoshAnalysis {
  /** @example "Tax evasion" */
  offenceDetails?: string
  /** @example "at home" */
  whereAndWhen?: string
  /** @example false */
  howDone?: string
  /** @example "hmrc" */
  whoVictims?: string
  /** @example "company secretary" */
  anyoneElsePresent?: string
  /** @example "Greed" */
  whyDone?: string
  /** @example "crown court" */
  sources?: string
}

export interface Alert {
  /** @example "risk to children" */
  description?: string
  /** @example "Sexual Offence" */
  alertType?: string
  /**
   * Date alert was created.
   * @format date
   * @example null
   */
  dateCreated?: string
}

export interface Risks {
  /** @example 45 */
  ogrsYear1?: number
  /** @example 65 */
  ogrsYear2?: number
  /** @example "High" */
  ogrsRisk?: string
  /** @example 23 */
  ovpYear1?: number
  /** @example 32 */
  ovpYear2?: number
  /** @example "Medium" */
  ovpRisk?: string
  /** @example 3.45 */
  rsrScore?: number
  /** @example "Medium" */
  rsrRisk?: string
  /** @example "Low" */
  ospcScore?: string
  /** @example "High" */
  ospiScore?: string
  /** @example "Low" */
  overallRoshLevel?: string
  /** @example "Medium" */
  riskPrisonersCustody?: string
  /** @example "Medium" */
  riskStaffCustody?: string
  /** @example "Medium" */
  riskKnownAdultCustody?: string
  /** @example "Medium" */
  riskPublicCustody?: string
  /** @example "Medium" */
  riskChildrenCustody?: string
  /** @example "Medium" */
  riskStaffCommunity?: string
  /** @example "Medium" */
  riskKnownAdultCommunity?: string
  /** @example "Medium" */
  riskPublicCommunity?: string
  /** @example "Medium" */
  riskChildrenCommunity?: string
  /** @example "Low" */
  imminentRiskOfViolenceTowardsPartner?: string
  /** @example "Low" */
  imminentRiskOfViolenceTowardsOthers?: string
  /** @example null */
  alerts?: Alert[]
}

export interface Relationships {
  /** @example null */
  dvEvidence?: boolean
  /** @example null */
  victimFormerPartner?: boolean
  /** @example null */
  victimFamilyMember?: boolean
  /** @example null */
  victimOfPartnerFamily?: boolean
  /** @example null */
  perpOfPartnerOrFamily?: boolean
  /** @example "This person has a history of domestic violence" */
  relIssuesDetails?: string
  /** @example "0-No problems" */
  relCloseFamily?: string
  /** @example "Not in a relationship" */
  relCurrRelationshipStatus?: string
  /** @example "2-Significant problems" */
  prevCloseRelationships?: string
  /** @example "0-No problems" */
  emotionalCongruence?: string
  /** @example "0-No problems" */
  relationshipWithPartner?: string
  /** @example "No" */
  prevOrCurrentDomesticAbuse?: string
}

export interface Psychiatric {
  /** @example "0-No problems" */
  description?: string
  /** @example null */
  difficultiesCoping?: string
  /** @example null */
  currPsychologicalProblems?: string
  /** @example null */
  selfHarmSuicidal?: string
}

export interface OffenceDetail {
  /** @example "Armed robbery" */
  offenceDetails?: string
  /** @example null */
  contactTargeting?: boolean
  /** @example null */
  raciallyMotivated?: boolean
  /** @example null */
  revenge?: boolean
  /** @example null */
  domesticViolence?: boolean
  /** @example null */
  repeatVictimisation?: boolean
  /** @example null */
  victimWasStranger?: boolean
  /** @example null */
  stalking?: boolean
  /** @example null */
  recognisesImpact?: boolean
  /** @example null */
  numberOfOthersInvolved?: string
  /** @example "There were two others involved who absconded at the scene" */
  othersInvolvedDetail?: string
  /** @example "This person is easily lead" */
  peerGroupInfluences?: string
  /** @example "Drug misuse fuels this persons motivation" */
  motivationAndTriggers?: string
  /** @example null */
  acceptsResponsibility?: boolean
  /** @example "This person fully accepts their actions" */
  acceptsResponsibilityDetail?: string
  /** @example "This person has a long history of robbery" */
  patternOffending?: string
}

export interface Lifestyle {
  /** @example "Drug addiction" */
  activitiesEncourageOffending?: string
  /** @example "Commits robbery to fund drug addiction" */
  lifestyleIssues?: string
  /** @example "1-Some problems" */
  easilyInfluenced?: string
}

export interface LearningNeeds {
  /** @example null */
  noFixedAbodeOrTransient?: boolean
  /** @example "0-No problems" */
  workRelatedSkills?: string
  /** @example "0-No problems" */
  problemsReadWriteNum?: string
  /** @example "0-No problems" */
  learningDifficulties?: string
  /** @example ["Numeracy","Reading","Writing"] */
  problemAreas?: string[]
  /** @example "0-Any qualifications" */
  qualifications?: string
  /** @example 6 */
  basicSkillsScore?: string
  /** @example "free text about this persons learning needs" */
  basicSkillsScoreDescription?: string
}

export interface Health {
  /** @example null */
  anyHealthConditions?: boolean
  /** @example "Blind in one eye" */
  description?: string
}

export interface DrugAlcoholDetail {
  /** @example null */
  drug?: OasysDrugDetail
  /** @example null */
  alcohol?: OasysAlcoholDetail
}

export interface OasysAlcoholDetail {
  /** @example null */
  alcoholLinkedToHarm?: string
  /** @example null */
  alcoholIssuesDetails?: string
  /** @example null */
  frequencyAndLevel?: string
  /** @example null */
  bingeDrinking?: string
}

export interface OasysDrugDetail {
  /** @example null */
  levelOfUseOfMainDrug?: string
  /** @example null */
  drugsMajorActivity?: string
}

export interface Behaviour {
  /** @example "0-No problems" */
  temperControl?: string
  /** @example "0-No problems" */
  problemSolvingSkills?: string
  /** @example "0-No problems" */
  awarenessOfConsequences?: string
  /** @example "0-No problems" */
  achieveGoals?: string
  /** @example "0-No problems" */
  understandsViewsOfOthers?: string
  /** @example "0-No problems" */
  concreteAbstractThinking?: string
  /** @example "0-No problems" */
  sexualPreOccupation?: string
  /** @example "0-No problems" */
  offenceRelatedSexualInterests?: string
  /** @example "0-No problems" */
  aggressiveControllingBehaviour?: string
  /** @example "0-No problems" */
  impulsivity?: string
}

export interface Attitude {
  /** @example "0-No problems" */
  proCriminalAttitudes?: string
  /** @example "0-No problems" */
  motivationToAddressBehaviour?: string
  /** @example "0-No problems" */
  hostileOrientation?: string
}

export interface OasysAssessmentDateInfo {
  /**
   * @format date
   * @example null
   */
  recentCompletedAssessmentDate?: string
  /** @example null */
  hasOpenAssessment?: boolean
}

export interface Audience {
  /**
   * @format uuid
   * @example "e4d1a44a-9c3b-4a7c-b79c-4d8a76488eb2"
   */
  id?: string
  /** @example "Sexual offence" */
  name?: string
  /** @example "orange" */
  colour?: string
}

export interface DomainScore {
  /** @example 1 */
  SexDomainScore: SexDomainScore
  /** @example 2 */
  ThinkingDomainScore: ThinkingDomainScore
  /** @example 1 */
  RelationshipDomainScore: RelationshipDomainScore
  /** @example 1 */
  SelfManagementDomainScore: SelfManagementDomainScore
}

export interface IndividualCognitiveScores {
  /**
   * @format int32
   * @example 2
   */
  proCriminalAttitudes?: number
  /**
   * @format int32
   * @example 2
   */
  hostileOrientation?: number
}

export interface IndividualRelationshipScores {
  /**
   * @format int32
   * @example 1
   */
  curRelCloseFamily?: number
  /**
   * @format int32
   * @example 1
   */
  prevExpCloseRel?: number
  /**
   * @format int32
   * @example 1
   */
  easilyInfluenced?: number
  /**
   * @format int32
   * @example 1
   */
  aggressiveControllingBehaviour?: number
}

export interface IndividualRiskScores {
  /** @example 1 */
  ogrs3?: number
  /**
   * The OGRS risk level
   * @example "Medium"
   */
  ogrs3Risk?: string
  /**
   * The OVP Risk level
   * @example "High"
   */
  ovpRisk?: string
  /** @example 2 */
  ovp?: number
  /** @example 0 */
  ospDc?: string
  /** @example 1 */
  ospIic?: string
  /** @example 5 */
  rsr?: number
  /** SARA related risk score */
  sara?: Sara
}

export interface IndividualSelfManagementScores {
  /**
   * @format int32
   * @example 2
   */
  impulsivity?: number
  /**
   * @format int32
   * @example 1
   */
  temperControl?: number
  /**
   * @format int32
   * @example 0
   */
  problemSolvingSkills?: number
  /** @format int32 */
  difficultiesCoping?: number
}

export interface IndividualSexScores {
  /**
   * @format int32
   * @example 1
   */
  sexualPreOccupation?: number
  /**
   * @format int32
   * @example 1
   */
  offenceRelatedSexualInterests?: number
  /**
   * @format int32
   * @example 1
   */
  emotionalCongruence?: number
}

export interface NeedsScore {
  /**
   * @format int32
   * @example 5
   */
  overallNeedsScore: number
  /**
   * @format int32
   * @example 6
   */
  basicSkillsScore?: number
  /** @example "High Intensity BC" */
  classification: string
  /** @example 5 */
  DomainScore: DomainScore
}

export interface PniScore {
  /** @example "A1234BC" */
  prisonNumber: string
  /** @example "D602550" */
  crn: string
  /**
   * @format int64
   * @example 2512235167
   */
  assessmentId: number
  /** @example "HIGH_INTENSITY_BC" */
  programmePathway: string
  /**
   * @example "{
   *   "needsScore": {
   *     "overallNeedsScore": 6,
   *     "domainScore": {
   *       "sexDomainScore": {
   *         "overAllSexDomainScore": 2,
   *         "individualSexScores": {
   *           "sexualPreOccupation": 2,
   *           "offenceRelatedSexualInterests": 2,
   *           "emotionalCongruence": 0
   *         }
   *       },
   *       "thinkingDomainScore": {
   *         "overallThinkingDomainScore": 1,
   *         "individualThinkingScores": {
   *           "proCriminalAttitudes": 1,
   *           "hostileOrientation": 1
   *         }
   *       },
   *       "relationshipDomainScore": {
   *         "overallRelationshipDomainScore": 1,
   *         "individualRelationshipScores": {
   *           "curRelCloseFamily": 0,
   *           "prevExpCloseRel": 2,
   *           "easilyInfluenced": 1,
   *           "aggressiveControllingBehaviour": 1
   *         }
   *       },
   *       "selfManagementDomainScore": {
   *         "overallSelfManagementDomainScore": 2,
   *         "individualSelfManagementScores": {
   *           "impulsivity": 1,
   *           "temperControl": 4,
   *           "problemSolvingSkills": 2,
   *           "difficultiesCoping": null
   *         }
   *       }
   *     }
   *   },
   * }
   * "
   */
  NeedsScore: NeedsScore
  /** @example "riskScores" */
  RiskScore: RiskScore
  /** @example "['impulsivity is missing ']" */
  validationErrors: string[]
}

export interface RelationshipDomainScore {
  /** @format int32 */
  overallRelationshipDomainScore?: number
  individualRelationshipScores: IndividualRelationshipScores
}

export interface RiskScore {
  /** @example "High Risk" */
  classification: string
  /** @example 2 */
  IndividualRiskScores: IndividualRiskScores
}

export interface Sara {
  /**
   * The overall SARA risk score
   * @example "LOW"
   */
  sara?: 'NOT_APPLICABLE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH'
  /**
   * Risk of violence towards partner
   * @example "LOW"
   */
  saraRiskOfViolenceTowardsPartner?: string
  /**
   * Risk of violence towards others
   * @example "LOW"
   */
  saraRiskOfViolenceTowardsOthers?: string
  /**
   * Assessment ID relevant to the SARA version of the assessment
   * @format int64
   * @example 2512235167
   */
  saraAssessmentId?: number
}

export interface SelfManagementDomainScore {
  /** @format int32 */
  overallSelfManagementDomainScore?: number
  individualSelfManagementScores: IndividualSelfManagementScores
}

export interface SexDomainScore {
  /**
   * @format int32
   * @example 2
   */
  overallSexDomainScore: number
  individualSexScores: IndividualSexScores
}

export interface ThinkingDomainScore {
  /** @format int32 */
  overallThinkingDomainScore?: number
  individualThinkingScores: IndividualCognitiveScores
}
