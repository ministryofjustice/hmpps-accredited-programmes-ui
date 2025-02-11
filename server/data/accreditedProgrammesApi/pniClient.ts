/* istanbul ignore file */
import config, { type ApiConfig } from '../../config'
import { apiPaths } from '../../paths'
import RestClient from '../restClient'
import type { PniScore, Referral } from '@accredited-programmes-api'
import type { SystemToken } from '@hmpps-auth'

export default class PniClient {
  restClient: RestClient

  constructor(systemToken: SystemToken) {
    this.restClient = new RestClient('pniClient', config.apis.accreditedProgrammesApi as ApiConfig, systemToken)
  }

  async findPni(
    prisonNumber: Referral['prisonNumber'],
    query?: {
      gender?: string
      savePNI?: boolean
    },
  ): Promise<PniScore> {
    return (await this.restClient.get({
      path: apiPaths.pni.show({ prisonNumber }),
      query: {
        ...(query?.gender && { gender: query.gender }),
        ...(query?.savePNI && { savePNI: 'true' }),
      },
    })) as PniScore
  }
}
