import type { HmppsAuthClient, PniClient, RestClientBuilder, RestClientBuilderWithoutToken } from '../data'
import type { Referral } from '@accredited-programmes/models'
import type { PniScore } from '@accredited-programmes-api'

export default class PniService {
  constructor(
    private readonly hmppsAuthClientBuilder: RestClientBuilderWithoutToken<HmppsAuthClient>,
    private readonly pniClientBuilder: RestClientBuilder<PniClient>,
  ) {}

  async getPni(
    username: Express.User['username'],
    prisonNumber: Referral['prisonNumber'],
    query?: { gender?: string; savePNI?: boolean },
  ): Promise<PniScore | null> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const pniClient = this.pniClientBuilder(systemToken)

    try {
      const pni = await pniClient.findPni(prisonNumber, query)

      return pni
    } catch (error) {
      return null
    }
  }
}
