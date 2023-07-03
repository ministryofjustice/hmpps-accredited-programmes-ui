import createError from 'http-errors'
import type { ResponseError } from 'superagent'

import { PrisonClient } from '../data'
import { organisationUtils } from '../utils'
import type { Organisation } from '@accredited-programmes/models'

export default class OrganisationService {
  prisonClient: PrisonClient

  constructor(token: string) {
    this.prisonClient = new PrisonClient(token)
  }

  async getOrganisation(id: string): Promise<Organisation | null> {
    try {
      const prison = await this.prisonClient.getPrison(id)

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
