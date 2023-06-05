import createError from 'http-errors'
import type { ResponseError } from 'superagent'

import RestClient from './restClient'
import type { ApiConfig } from '../config'
import config from '../config'
import paths from '../paths/prisonApi'
import type { Prison } from '@prison-api'

export default class PrisonClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('prisonClient', config.apis.prisonApi as ApiConfig, token)
  }

  async getPrison(agencyId: string): Promise<Prison | null> {
    try {
      return (await this.restClient.get({ path: paths.prisons.show({ agencyId }) })) as Prison
    } catch (error) {
      const knownError = error as ResponseError

      if (knownError.status === 404) {
        return null
      }

      throw createError(knownError.status || 500, knownError, {
        userMessage: 'Could not get prison from Prison API.',
      })
    }
  }
}
