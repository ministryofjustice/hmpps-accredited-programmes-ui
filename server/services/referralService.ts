import type { HmppsAuthClient, ReferralClient, RestClientBuilder, RestClientBuilderWithoutToken } from '../data'
import type {
  CreatedReferralResponse,
  Organisation,
  Paginated,
  Referral,
  ReferralStatus,
  ReferralUpdate,
  ReferralView,
} from '@accredited-programmes/models'

export default class ReferralService {
  constructor(
    private readonly hmppsAuthClientBuilder: RestClientBuilderWithoutToken<HmppsAuthClient>,
    private readonly referralClientBuilder: RestClientBuilder<ReferralClient>,
  ) {}

  async createReferral(
    username: Express.User['username'],
    courseOfferingId: Referral['offeringId'],
    prisonNumber: Referral['prisonNumber'],
  ): Promise<CreatedReferralResponse> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const referralClient = this.referralClientBuilder(systemToken)

    return referralClient.create(courseOfferingId, prisonNumber)
  }

  async getMyReferralViews(
    username: Express.User['username'],
    query?: { page?: string; sortColumn?: string; sortDirection?: string; status?: string },
  ): Promise<Paginated<ReferralView>> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const referralClient = this.referralClientBuilder(systemToken)

    return referralClient.findMyReferralViews(query)
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

  async getReferral(
    username: Express.User['username'],
    referralId: Referral['id'],
    query?: { updatePerson?: string },
  ): Promise<Referral> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const referralClient = this.referralClientBuilder(systemToken)

    return referralClient.find(referralId, query)
  }

  async getReferralViews(
    username: Express.User['username'],
    organisationId: Organisation['id'],
    query?: {
      audience?: string
      courseName?: string
      page?: string
      sortColumn?: string
      sortDirection?: string
      status?: string
    },
  ): Promise<Paginated<ReferralView>> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const referralClient = this.referralClientBuilder(systemToken)

    return referralClient.findReferralViews(organisationId, query)
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
