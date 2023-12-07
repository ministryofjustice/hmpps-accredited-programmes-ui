import type { Course } from './Course'
import type { CourseAudience } from './CourseAudience'
import type { CourseOffering } from './CourseOffering'
import type { Person } from './Person'

type Referral = {
  id: string // eslint-disable-next-line @typescript-eslint/member-ordering
  additionalInformation: string
  hasReviewedProgrammeHistory: boolean
  oasysConfirmed: boolean
  offeringId: CourseOffering['id']
  prisonNumber: Person['prisonNumber']
  referrerId: Express.User['userId']
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
  audiences: Array<CourseAudience['value']>
  courseName: Course['name']
  prisonNumber: Person['prisonNumber']
  status: ReferralStatus
  submittedOn?: Referral['submittedOn']
}

export type { CreatedReferralResponse, Referral, ReferralStatus, ReferralSummary, ReferralUpdate }
