import createHttpError from 'http-errors'

import type { AuthenticationClient, PniClient, RestClientBuilder, RestClientBuilderWithoutToken } from '../data'
import type { SanitisedError } from '../sanitisedError'
import type { PniScore, Referral } from '@accredited-programmes-api'

export default class PniService {
  constructor(
    private readonly hmppsAuthClientBuilder: RestClientBuilderWithoutToken<AuthenticationClient>,
    private readonly pniClientBuilder: RestClientBuilder<PniClient>,
  ) {}

  async getPni(
    username: Express.User['username'],
    prisonNumber: Referral['prisonNumber'],
    query?: { gender?: string; savePNI?: boolean },
  ): Promise<PniScore | null> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getToken(username)
    const pniClient = this.pniClientBuilder(systemToken)

    try {
      const pni = await pniClient.findPni(prisonNumber, query)

      return pni
    } catch (error) {
      const sanitisedError = error as SanitisedError

      if (sanitisedError.responseStatus === 404) {
        return null
      }

      throw createHttpError(
        sanitisedError.responseStatus || 500,
        `Error fetching PNI data for prison number ${prisonNumber}.`,
      )
    }
  }
}
