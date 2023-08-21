type Referral = {
  id: string // eslint-disable-next-line @typescript-eslint/member-ordering
  offeringId: string
  prisonNumber: string
  referrerId: string
}

type CreatedReferralResponse = {
  referralId: Referral['id']
}

export type { CreatedReferralResponse, Referral }
