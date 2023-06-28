import createError from 'http-errors'
import type { ResponseError } from 'superagent'

import type { PrisonClient, RestClientBuilder } from '../data'
import { organisationUtils } from '../utils'
import type { Organisation } from '@accredited-programmes/models'

export default class OrganisationService {
  constructor(private readonly prisonClientBuilder: RestClientBuilder<PrisonClient>) {}

  async getOrganisation(token: string, id: string): Promise<Organisation | null> {
    const prisonClient = this.prisonClientBuilder(token)

    try {
      const prison = await prisonClient.getPrison(id)

      if (!prison.active) {
        return null
      }

      return organisationUtils.organisationFromPrison(id, prison)
    } catch (error) {
      const knownError = error as ResponseError

      if (knownError.status === 404) {
        return null
      }

      throw createError(knownError.status || 500, knownError, {
        userMessage: `Error fetching organisation ${id}.`,
      })
    }
  }
}
