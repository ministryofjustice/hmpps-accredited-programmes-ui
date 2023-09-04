import type { ReferralClient, RestClientBuilder } from '../data'
import type { CreatedReferralResponse, Referral, ReferralUpdate } from '@accredited-programmes/models'

export default class ReferralService {
  constructor(private readonly referralClientBuilder: RestClientBuilder<ReferralClient>) {}

  async createReferral(
    token: Express.User['token'],
    courseOfferingId: Referral['offeringId'],
    prisonNumber: Referral['prisonNumber'],
    referrerId: Referral['referrerId'],
  ): Promise<CreatedReferralResponse> {
    const referralClient = this.referralClientBuilder(token)
    return referralClient.create(courseOfferingId, prisonNumber, referrerId)
  }

  async getReferral(token: Express.User['token'], referralId: Referral['id']): Promise<Referral> {
    const referralClient = this.referralClientBuilder(token)
    return referralClient.find(referralId)
  }

  async updateReferral(
    token: Express.User['token'],
    referralId: Referral['id'],
    referralUpdate: ReferralUpdate,
  ): Promise<void> {
    const referralClient = this.referralClientBuilder(token)
    return referralClient.update(referralId, referralUpdate)
  }
}
