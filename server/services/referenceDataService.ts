import type { HmppsAuthClient, ReferenceDataClient, RestClientBuilder, RestClientBuilderWithoutToken } from '../data'
import type {
  ReferralStatus,
  ReferralStatusCategory,
  ReferralStatusReason,
  ReferralStatusRefData,
  ReferralStatusUppercase,
} from '@accredited-programmes/models'

export default class ReferenceDataService {
  constructor(
    private readonly hmppsAuthClientBuilder: RestClientBuilderWithoutToken<HmppsAuthClient>,
    private readonly referenceDataClient: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async getReferralStatusCodeCategories(
    username: Express.User['username'],
    referralStatusCode: ReferralStatusUppercase,
  ): Promise<Array<ReferralStatusCategory>> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const referenceDataClient = this.referenceDataClient(systemToken)

    return referenceDataClient.findReferralStatusCodeCategories(referralStatusCode)
  }

  async getReferralStatusCodeData(
    username: Express.User['username'],
    referralStatusCode: ReferralStatus | ReferralStatusUppercase,
  ): Promise<ReferralStatusRefData> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const referenceDataClient = this.referenceDataClient(systemToken)

    return referenceDataClient.findReferralStatusCodeData(referralStatusCode)
  }

  async getReferralStatusCodeReasons(
    username: Express.User['username'],
    categoryCode: Uppercase<string>,
    referralStatusCode: ReferralStatusUppercase,
  ): Promise<Array<ReferralStatusReason>> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const referenceDataClient = this.referenceDataClient(systemToken)

    return referenceDataClient.findReferralStatusCodeReasons(categoryCode, referralStatusCode)
  }

  async getReferralStatuses(username: Express.User['username']): Promise<Array<ReferralStatusRefData>> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const referenceDataClient = this.referenceDataClient(systemToken)

    return referenceDataClient.findReferralStatuses()
  }
}
