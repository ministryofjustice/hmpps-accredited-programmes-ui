import createError from 'http-errors'
import type { ResponseError } from 'superagent'

import type { HmppsAuthClient, OasysClient, RestClientBuilder, RestClientBuilderWithoutToken } from '../data'
import type { OffenceDetail, Referral, RoshAnalysis } from '@accredited-programmes/models'

export default class OasysService {
  constructor(
    private readonly hmppsAuthClientBuilder: RestClientBuilderWithoutToken<HmppsAuthClient>,
    private readonly oasysClientBuilder: RestClientBuilder<OasysClient>,
  ) {}

  async getOffenceDetails(
    username: Express.User['username'],
    prisonNumber: Referral['prisonNumber'],
  ): Promise<OffenceDetail | null> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const oasysClient = this.oasysClientBuilder(systemToken)

    try {
      const offenceDetails = await oasysClient.findOffenceDetails(prisonNumber)

      return offenceDetails
    } catch (error) {
      const knownError = error as ResponseError

      if (knownError.status === 404) {
        return null
      }

      throw createError(knownError.status || 500, `Error fetching offence details for prison number ${prisonNumber}.`)
    }
  }

  async getRoshAnalysis(
    username: Express.User['username'],
    prisonNumber: Referral['prisonNumber'],
  ): Promise<RoshAnalysis | null> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const oasysClient = this.oasysClientBuilder(systemToken)

    try {
      const roshAnalysis = await oasysClient.findRoshAnalysis(prisonNumber)

      return roshAnalysis
    } catch (error) {
      const knownError = error as ResponseError

      if (knownError.status === 404) {
        return null
      }

      throw createError(knownError.status || 500, `Error fetching ROSH analysis for prison number ${prisonNumber}.`)
    }
  }
}
