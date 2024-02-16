import type { Course } from './Course'
import type { CourseOffering } from './CourseOffering'
import type { Organisation } from './Organisation'
import type { Person } from './Person'
import type { User } from '@manage-users-api'
import type { Prisoner } from '@prisoner-search'

type Referral = {
  additionalInformation: string // eslint-disable-next-line @typescript-eslint/member-ordering
  hasReviewedProgrammeHistory: boolean
  id: string
  oasysConfirmed: boolean
  offeringId: CourseOffering['id']
  prisonNumber: Person['prisonNumber']
  referrerUsername: Express.User['username']
  status: string
  statusColour: string
  statusDescription: string
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
  status?: Referral['status']
  statusColour?: Referral['statusColour']
  statusDescription?: Referral['statusDescription']
  submittedOn?: Referral['submittedOn']
  surname?: string
  tariffExpiryDate?: Person['tariffDate']
  tasksCompleted?: number
}

export type { CreatedReferralResponse, Referral, ReferralUpdate, ReferralView }
