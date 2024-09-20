import type { Course } from './Course'
import type { CourseOffering } from './CourseOffering'
import type { Organisation } from './Organisation'
import type { Person } from './Person'
import type { TagColour } from '@accredited-programmes/ui'
import type { User } from '@manage-users-api'
import type { Prisoner } from '@prisoner-search'

const referralStatuses = [
  'assessed_suitable',
  'assessment_started',
  'awaiting_assessment',
  'deselected',
  'not_suitable',
  'on_hold_awaiting_assessment',
  'on_hold_assessment_started',
  'on_hold_referral_submitted',
  'on_programme',
  'programme_complete',
  'referral_started',
  'referral_submitted',
  'suitable_not_ready',
  'withdrawn',
] as const

const referralStatusGroups = ['open', 'draft', 'closed'] as const

interface ConfirmationFields {
  hasConfirmation: boolean
  notesOptional: boolean
  primaryDescription: string
  primaryHeading: string
  secondaryDescription: string
  secondaryHeading: string
  warningText: string
}

type Referral = {
  id: string // eslint-disable-next-line @typescript-eslint/member-ordering
  additionalInformation: string
  hasReviewedProgrammeHistory: boolean
  oasysConfirmed: boolean
  offeringId: CourseOffering['id']
  prisonNumber: Person['prisonNumber']
  referrerUsername: Express.User['username']
  status: ReferralStatus
  closed?: boolean
  statusColour?: TagColour
  statusDescription?: string
  submittedOn?: string
}

type CreatedReferralResponse = {
  referralId: Referral['id']
}

type ReferralUpdate = {
  hasReviewedProgrammeHistory: Referral['hasReviewedProgrammeHistory']
  oasysConfirmed: Referral['oasysConfirmed']
  additionalInformation?: Referral['additionalInformation']
}

type ReferralStatus = (typeof referralStatuses)[number]

type ReferralStatusUppercase = Uppercase<ReferralStatus>

type ReferralStatusCategory = {
  code: string
  description: string
  referralStatusCode: ReferralStatusUppercase
}

type ReferralStatusGroup = (typeof referralStatusGroups)[number]

type ReferralStatusReason = {
  code: Uppercase<string>
  description: string
  referralCategoryCode: Uppercase<string>
}

type ReferralStatusUpdate = {
  status: ReferralStatus | ReferralStatusUppercase
  category?: Uppercase<string>
  notes?: string
  ptUser?: boolean
  reason?: Uppercase<string>
}

type ReferralStatusRefData = {
  code: ReferralStatusUppercase
  colour: TagColour
  description: string
  closed?: boolean
  confirmationText?: string
  deselectAndKeepOpen?: boolean
  draft?: boolean
  hasConfirmation?: boolean
  hasNotes?: boolean
  hintText?: string
  hold?: boolean
  notesOptional?: boolean
  release?: boolean
}

type ReferralView = {
  id: Referral['id'] // eslint-disable-next-line @typescript-eslint/member-ordering
  audience?: string
  conditionalReleaseDate?: Person['conditionalReleaseDate']
  courseName?: Course['name']
  earliestReleaseDate?: string
  earliestReleaseDateType?: string
  forename?: string
  listDisplayName?: string
  location?: string
  nonDtoReleaseDateType?: Prisoner['nonDtoReleaseDateType']
  organisationId?: Organisation['id']
  organisationName?: Organisation['name']
  paroleEligibilityDate?: Person['paroleEligibilityDate']
  prisonNumber?: Person['prisonNumber']
  referrerUsername?: User['username']
  sentenceType?: string
  status?: ReferralStatus
  statusColour?: Referral['statusColour']
  statusDescription?: Referral['statusDescription']
  submittedOn?: Referral['submittedOn']
  surname?: string
  tariffExpiryDate?: Person['tariffDate']
  tasksCompleted?: number
}

export { referralStatusGroups, referralStatuses }

export type {
  ConfirmationFields,
  CreatedReferralResponse,
  Referral,
  ReferralStatus,
  ReferralStatusCategory,
  ReferralStatusGroup,
  ReferralStatusReason,
  ReferralStatusRefData,
  ReferralStatusUpdate,
  ReferralStatusUppercase,
  ReferralUpdate,
  ReferralView,
}
