import type { HmppsAuthClient, ReferenceDataClient, RestClientBuilder, RestClientBuilderWithoutToken } from '../data'
import type { ReferralStatusCategory, ReferralStatusUppercase } from '@accredited-programmes/models'

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
}
