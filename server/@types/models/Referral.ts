import type { CourseOffering } from './CourseOffering'
import type { Person } from './Person'

type Referral = {
  id: string // eslint-disable-next-line @typescript-eslint/member-ordering
  hasReviewedProgrammeHistory: boolean
  oasysConfirmed: boolean
  offeringId: CourseOffering['id']
  prisonNumber: Person['prisonNumber']
  reason: string
  referrerId: Express.User['userId']
  status: ReferralStatus
}

type CreatedReferralResponse = {
  referralId: Referral['id']
}

type ReferralUpdate = {
  hasReviewedProgrammeHistory: Referral['hasReviewedProgrammeHistory']
  oasysConfirmed: Referral['oasysConfirmed']
  reason?: Referral['reason']
}

type ReferralStatus = 'assessment_started' | 'awaiting_assesment' | 'referral_started' | 'referral_submitted'

export type { CreatedReferralResponse, Referral, ReferralStatus, ReferralUpdate }
