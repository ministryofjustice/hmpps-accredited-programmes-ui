import type { HmppsAuthClient, ReferralClient, RestClientBuilder, RestClientBuilderWithoutToken } from '../data'
import type {
  PaginatedReferralSummary,
  Referral,
  ReferralCreated,
  ReferralStatus,
  ReferralUpdate,
} from '@accredited-programmes/api'
import type { Organisation } from '@accredited-programmes/ui'

export default class ReferralService {
  constructor(
    private readonly hmppsAuthClientBuilder: RestClientBuilderWithoutToken<HmppsAuthClient>,
    private readonly referralClientBuilder: RestClientBuilder<ReferralClient>,
  ) {}

  async createReferral(
    username: Express.User['username'],
    courseOfferingId: Referral['offeringId'],
    prisonNumber: Referral['prisonNumber'],
  ): Promise<ReferralCreated> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const referralClient = this.referralClientBuilder(systemToken)

    return referralClient.create(courseOfferingId, prisonNumber)
  }

  async getMyReferralSummaries(
    username: Express.User['username'],
    query?: { page?: string; status?: string },
  ): Promise<PaginatedReferralSummary> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const referralClient = this.referralClientBuilder(systemToken)

    return referralClient.findMyReferralSummaries(query)
  }

  async getNumberOfTasksCompleted(username: Express.User['username'], referralId: Referral['id']): Promise<number> {
    const referralProgressIndicatorKeys = [
      'additionalInformation',
      'hasReviewedProgrammeHistory',
      'oasysConfirmed',
      'prisonNumber',
    ] as const

    const referral = await this.getReferral(username, referralId)

    return referralProgressIndicatorKeys.filter(item => referral[item]).length
  }

  async getReferral(username: Express.User['username'], referralId: Referral['id']): Promise<Referral> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const referralClient = this.referralClientBuilder(systemToken)

    return referralClient.find(referralId)
  }

  async getReferralSummaries(
    username: Express.User['username'],
    organisationId: Organisation['id'],
    query?: { audience?: string; courseName?: string; page?: string; status?: string },
  ): Promise<PaginatedReferralSummary> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const referralClient = this.referralClientBuilder(systemToken)

    return referralClient.findReferralSummaries(organisationId, query)
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
