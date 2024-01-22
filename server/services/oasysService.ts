import createError from 'http-errors'
import type { ResponseError } from 'superagent'

import type { HmppsAuthClient, OasysClient, RestClientBuilder, RestClientBuilderWithoutToken } from '../data'
import type {
  Lifestyle,
  OffenceDetail,
  Psychiatric,
  Referral,
  Relationships,
  RoshAnalysis,
} from '@accredited-programmes/models'

export default class OasysService {
  constructor(
    private readonly hmppsAuthClientBuilder: RestClientBuilderWithoutToken<HmppsAuthClient>,
    private readonly oasysClientBuilder: RestClientBuilder<OasysClient>,
  ) {}

  async getLifestyle(
    username: Express.User['username'],
    prisonNumber: Referral['prisonNumber'],
  ): Promise<Lifestyle | null> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const oasysClient = this.oasysClientBuilder(systemToken)

    try {
      const lifestyle = await oasysClient.findLifestyle(prisonNumber)

      return lifestyle
    } catch (error) {
      const knownError = error as ResponseError

      if (knownError.status === 404) {
        return null
      }

      throw createError(knownError.status || 500, `Error fetching lifestyle data for prison number ${prisonNumber}.`)
    }
  }

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

  async getPsychiatric(
    username: Express.User['username'],
    prisonNumber: Referral['prisonNumber'],
  ): Promise<Psychiatric | null> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const oasysClient = this.oasysClientBuilder(systemToken)

    try {
      const psychiatric = await oasysClient.findPsychiatric(prisonNumber)

      return psychiatric
    } catch (error) {
      const knownError = error as ResponseError

      if (knownError.status === 404) {
        return null
      }

      throw createError(knownError.status || 500, `Error fetching psychiatric data for prison number ${prisonNumber}.`)
    }
  }

  async getRelationships(
    username: Express.User['username'],
    prisonNumber: Referral['prisonNumber'],
  ): Promise<Relationships | null> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const oasysClient = this.oasysClientBuilder(systemToken)

    try {
      const relationships = await oasysClient.findRelationships(prisonNumber)

      return relationships
    } catch (error) {
      const knownError = error as ResponseError

      if (knownError.status === 404) {
        return null
      }

      throw createError(knownError.status || 500, `Error fetching relationships for prison number ${prisonNumber}.`)
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
