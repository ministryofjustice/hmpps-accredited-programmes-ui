import type { HmppsAuthClient, OasysClient, RestClientBuilder, RestClientBuilderWithoutToken } from '../data'
import type { OffenceDetail, Referral } from '@accredited-programmes/models'

export default class OasysService {
  constructor(
    private readonly hmppsAuthClientBuilder: RestClientBuilderWithoutToken<HmppsAuthClient>,
    private readonly oasysClientBuilder: RestClientBuilder<OasysClient>,
  ) {}

  async getOffenceDetails(
    username: Express.User['username'],
    prisonNumber: Referral['prisonNumber'],
  ): Promise<Array<OffenceDetail>> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const oasysClient = this.oasysClientBuilder(systemToken)

    return oasysClient.findOffenceDetails(prisonNumber)
  }
}
