import type { Course } from './Course'
import type { CourseAudience } from './CourseAudience'
import type { CourseOffering } from './CourseOffering'
import type { Organisation } from './Organisation'
import type { Person } from './Person'
import type { User } from '@manage-users-api'
import type { Prisoner } from '@prisoner-search'

type Referral = {
  id: string // eslint-disable-next-line @typescript-eslint/member-ordering
  additionalInformation: string
  hasReviewedProgrammeHistory: boolean
  oasysConfirmed: boolean
  offeringId: CourseOffering['id']
  prisonNumber: Person['prisonNumber']
  referrerUsername: Express.User['username']
  status: ReferralStatus
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

type ReferralStatus = 'assessment_started' | 'awaiting_assessment' | 'referral_started' | 'referral_submitted'

type ReferralSummary = {
  id: Referral['id'] // eslint-disable-next-line @typescript-eslint/member-ordering
  audience: CourseAudience
  courseName: Course['name']
  prisonNumber: Person['prisonNumber']
  referrerUsername: User['username']
  status: ReferralStatus
  earliestReleaseDate?: Person['conditionalReleaseDate'] | Person['paroleEligibilityDate'] | Person['tariffDate']
  organisationId?: Organisation['id']
  prisonerName?: {
    firstName: Prisoner['firstName']
    lastName: Prisoner['lastName']
  }
  prisonName?: Organisation['name']
  sentence?: {
    conditionalReleaseDate?: Person['conditionalReleaseDate']
    indeterminateSentence?: Person['indeterminateSentence']
    nonDtoReleaseDateType?: Prisoner['nonDtoReleaseDateType']
    paroleEligibilityDate?: Person['paroleEligibilityDate']
    tariffExpiryDate?: Person['tariffDate']
  }
  submittedOn?: Referral['submittedOn']
  tasksCompleted?: number
}

export type { CreatedReferralResponse, Referral, ReferralStatus, ReferralSummary, ReferralUpdate }
