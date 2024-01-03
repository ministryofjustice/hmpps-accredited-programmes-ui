import type { HmppsAuthClient, ReferralClient, RestClientBuilder, RestClientBuilderWithoutToken } from '../data'
import type {
  Course,
  CourseAudience,
  CreatedReferralResponse,
  Organisation,
  Paginated,
  Referral,
  ReferralStatus,
  ReferralSummary,
  ReferralUpdate,
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

  async getMyReferralSummaries(
    username: Express.User['username'],
    query?: { page?: string; status?: string },
  ): Promise<Paginated<ReferralSummary>> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const referralClient = this.referralClientBuilder(systemToken)

    return referralClient.findMyReferralSummaries(query)
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
    query?: { audience?: CourseAudience['value']; courseName?: Course['name']; page?: string; status?: string },
  ): Promise<Paginated<ReferralSummary>> {
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
