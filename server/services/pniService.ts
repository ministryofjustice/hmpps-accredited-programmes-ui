import createError from 'http-errors'
import type { ResponseError } from 'superagent'

import type { HmppsAuthClient, PniClient, RestClientBuilder, RestClientBuilderWithoutToken } from '../data'
import type { Referral } from '@accredited-programmes/models'
import type { PniScore } from '@accredited-programmes-api'

export default class PniService {
  constructor(
    private readonly hmppsAuthClientBuilder: RestClientBuilderWithoutToken<HmppsAuthClient>,
    private readonly pniClientBuilder: RestClientBuilder<PniClient>,
  ) {}

  async getPni(username: Express.User['username'], prisonNumber: Referral['prisonNumber']): Promise<PniScore | null> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const pniClient = this.pniClientBuilder(systemToken)

    try {
      const pni = await pniClient.findPni(prisonNumber)

      return pni
    } catch (error) {
      const knownError = error as ResponseError

      if (knownError.status === 400 || knownError.status === 404) {
        return null
      }

      throw createError(knownError.status || 500, `Error fetching PNI data for prison number ${prisonNumber}.`)
    }
  }
}
