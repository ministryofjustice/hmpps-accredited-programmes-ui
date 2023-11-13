import type { HmppsAuthClient, ReferralClient, RestClientBuilder, RestClientBuilderWithoutToken } from '../data'
import type { CreatedReferralResponse, Referral, ReferralStatus, ReferralUpdate } from '@accredited-programmes/models'

export default class ReferralService {
  constructor(
    private readonly hmppsAuthClientBuilder: RestClientBuilderWithoutToken<HmppsAuthClient>,
    private readonly referralClientBuilder: RestClientBuilder<ReferralClient>,
  ) {}

  async createReferral(
    username: Express.User['username'],
    courseOfferingId: Referral['offeringId'],
    prisonNumber: Referral['prisonNumber'],
    referrerId: Referral['referrerId'],
  ): Promise<CreatedReferralResponse> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const referralClient = this.referralClientBuilder(systemToken)

    return referralClient.create(courseOfferingId, prisonNumber, referrerId)
  }

  async getReferral(username: Express.User['username'], referralId: Referral['id']): Promise<Referral> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const referralClient = this.referralClientBuilder(systemToken)

    return referralClient.find(referralId)
  }

  async submitReferral(username: Express.User['username'], referralId: Referral['id']): Promise<void> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const referralClient = this.referralClientBuilder(systemToken)

    return referralClient.submit(referralId)
  }

  async updateReferral(
    username: Express.User['username'],
    referralId: Referral['id'],
    referralUpdate: ReferralUpdate,
  ): Promise<void> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const referralClient = this.referralClientBuilder(systemToken)

    return referralClient.update(referralId, referralUpdate)
  }

  async updateReferralStatus(
    username: Express.User['username'],
    referralId: Referral['id'],
    status: ReferralStatus,
  ): Promise<void> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const referralClient = this.referralClientBuilder(systemToken)

    return referralClient.updateStatus(referralId, status)
  }
}
