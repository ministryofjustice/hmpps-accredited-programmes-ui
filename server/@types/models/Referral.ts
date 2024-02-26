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
  'on_programme',
  'programme_complete',
  'referral_started',
  'referral_submitted',
  'suitable_not_ready',
  'withdrawn',
] as const

type Referral = {
  id: string // eslint-disable-next-line @typescript-eslint/member-ordering
  additionalInformation: string
  hasReviewedProgrammeHistory: boolean
  oasysConfirmed: boolean
  offeringId: CourseOffering['id']
  prisonNumber: Person['prisonNumber']
  referrerUsername: Express.User['username']
  status: ReferralStatus
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

type ReferralStatusHistory = {
  id?: string
  notes?: string
  previousStatus?: Referral['status']
  previousStatusColour?: Referral['statusColour']
  previousStatusDescription?: Referral['statusDescription']
  referralId?: Referral['id']
  status?: Referral['status']
  statusColour?: Referral['statusColour']
  statusDescription?: Referral['statusDescription']
  statusStartDate?: string
  username?: User['username']
}

type ReferralView = {
  id: Referral['id'] // eslint-disable-next-line @typescript-eslint/member-ordering
  audience?: string
  conditionalReleaseDate?: Person['conditionalReleaseDate']
  courseName?: Course['name']
  earliestReleaseDate?: Person['conditionalReleaseDate'] | Person['paroleEligibilityDate'] | Person['tariffDate']
  earliestReleaseDateType?: string
  forename?: string
  nonDtoReleaseDateType?: Prisoner['nonDtoReleaseDateType']
  organisationId?: Organisation['id']
  organisationName?: Organisation['name']
  paroleEligibilityDate?: Person['paroleEligibilityDate']
  prisonNumber?: Person['prisonNumber']
  referrerUsername?: User['username']
  status?: ReferralStatus
  statusColour?: Referral['statusColour']
  statusDescription?: Referral['statusDescription']
  submittedOn?: Referral['submittedOn']
  surname?: string
  tariffExpiryDate?: Person['tariffDate']
  tasksCompleted?: number
}

export { referralStatuses }
export type {
  CreatedReferralResponse,
  Referral,
  ReferralStatus,
  ReferralStatusCategory,
  ReferralStatusHistory,
  ReferralStatusUppercase,
  ReferralUpdate,
  ReferralView,
}
