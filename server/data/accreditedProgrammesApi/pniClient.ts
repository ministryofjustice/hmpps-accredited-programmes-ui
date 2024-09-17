/* istanbul ignore file */
import config, { type ApiConfig } from '../../config'
import { apiPaths } from '../../paths'
import RestClient from '../restClient'
import type { Referral } from '@accredited-programmes/models'
import type { PniScore } from '@accredited-programmes-api'
import type { SystemToken } from '@hmpps-auth'

export default class PniClient {
  restClient: RestClient

  constructor(systemToken: SystemToken) {
    this.restClient = new RestClient('pniClient', config.apis.accreditedProgrammesApi as ApiConfig, systemToken)
  }

  async findPni(prisonNumber: Referral['prisonNumber']): Promise<PniScore> {
    return (await this.restClient.get({
      path: apiPaths.pni.show({ prisonNumber }),
    })) as PniScore
  }
}
