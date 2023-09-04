import type { CourseOffering } from './CourseOffering'
import type { Person } from './Person'

type Referral = {
  id: string // eslint-disable-next-line @typescript-eslint/member-ordering
  offeringId: CourseOffering['id']
  prisonNumber: Person['prisonNumber']
  referrerId: Express.User['userId']
}

type CreatedReferralResponse = {
  referralId: Referral['id']
}

type ReferralUpdate = {
  oasysConfirmed: boolean
  reason?: string
}

export type { CreatedReferralResponse, Referral, ReferralUpdate }
