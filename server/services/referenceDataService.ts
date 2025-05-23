import type { HmppsAuthClient, ReferenceDataClient, RestClientBuilder, RestClientBuilderWithoutToken } from '../data'
import type {
  ReferralStatus,
  ReferralStatusCategory,
  ReferralStatusRefData,
  ReferralStatusUppercase,
  ReferralStatusWithReasons,
} from '@accredited-programmes/models'
import type { ReferralStatusReason, SexualOffenceDetails } from '@accredited-programmes-api'

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
    query?: {
      deselectAndKeepOpen?: boolean
    },
  ): Promise<Array<ReferralStatusReason>> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const referenceDataClient = this.referenceDataClient(systemToken)

    return referenceDataClient.findReferralStatusCodeReasons(categoryCode, referralStatusCode, query)
  }

  async getReferralStatusCodeReasonsWithCategory(
    username: Express.User['username'],
    referralStatusCode: ReferralStatusWithReasons,
    query?: {
      deselectAndKeepOpen?: boolean
    },
  ): Promise<Array<ReferralStatusReason>> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const referenceDataClient = this.referenceDataClient(systemToken)

    return referenceDataClient.findReferralStatusCodeReasonsWithCategory(referralStatusCode, query)
  }

  async getReferralStatuses(username: Express.User['username']): Promise<Array<ReferralStatusRefData>> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const referenceDataClient = this.referenceDataClient(systemToken)

    return referenceDataClient.findReferralStatuses()
  }

  async getSexualOffenceDetails(username: Express.User['username']): Promise<Array<SexualOffenceDetails>> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const referenceDataClient = this.referenceDataClient(systemToken)

    return referenceDataClient.findSexualOffenceDetails()
  }
}
