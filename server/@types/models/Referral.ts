import type { CourseOffering } from './CourseOffering'
import type { Person } from './Person'

type Referral = {
  id: string // eslint-disable-next-line @typescript-eslint/member-ordering
  hasCourseHistory: boolean
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
  oasysConfirmed: Referral['oasysConfirmed']
  reason?: Referral['reason']
}

type ReferralStatus = 'awaiting_assesment' | 'assessment_started' | 'referral_started' | 'referral_submitted'

export type { CreatedReferralResponse, Referral, ReferralStatus, ReferralUpdate }
