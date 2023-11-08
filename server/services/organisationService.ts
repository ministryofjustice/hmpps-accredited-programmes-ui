import createError from 'http-errors'
import type { ResponseError } from 'superagent'

import type { PrisonRegisterApiClient, RestClientBuilder } from '../data'
import { OrganisationUtils, TypeUtils } from '../utils'
import type { Organisation } from '@accredited-programmes/models'
import type { Prison } from '@prison-register-api'

export default class OrganisationService {
  constructor(private readonly prisonRegisterApiClientBuilder: RestClientBuilder<PrisonRegisterApiClient>) {}

  async getOrganisation(token: Express.User['token'], organisationId: Organisation['id']): Promise<Organisation> {
    const prisonRegisterApiClient = this.prisonRegisterApiClientBuilder(token)

    try {
      const prison = await prisonRegisterApiClient.find(organisationId)

      if (!prison.active) {
        throw createError(404)
      }

      return OrganisationUtils.organisationFromPrison(prison)
    } catch (error) {
      const knownError = error as ResponseError

      if (knownError.status === 404) {
        throw createError(knownError.status, `Active organisation with ID ${organisationId} not found.`)
      }

      const errorMessage =
        knownError.message === 'Internal Server Error'
          ? `Error fetching organisation ${organisationId}.`
          : knownError.message

      throw createError(knownError.status || 500, errorMessage)
    }
  }

  async getOrganisations(
    token: Express.User['token'],
    organisationIds: Array<Organisation['id']>,
  ): Promise<Array<Organisation>> {
    const prisonRegisterApiClient = this.prisonRegisterApiClientBuilder(token)

    const prisonResults: Array<Prison | null> = await Promise.all(
      organisationIds.map(async organisationId => {
        try {
          return await prisonRegisterApiClient.find(organisationId)
        } catch (error) {
          const knownError = error as ResponseError

          if (knownError.status === 404) {
            return null
          }

          throw createError(knownError.status || 500, `Error fetching organisation ${organisationId}.`)
        }
      }),
    )

    const foundPrisons = prisonResults.filter(TypeUtils.isNotNull<Prison>)

    return foundPrisons
      .filter(prison => prison.active)
      .map(activePrison => OrganisationUtils.organisationFromPrison(activePrison))
  }
}
