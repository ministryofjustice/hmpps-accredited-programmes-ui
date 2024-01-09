/* istanbul ignore file */
import config, { type ApiConfig } from '../../config'
import { apiPaths } from '../../paths'
import RestClient from '../restClient'
import type { OffenceDetail, Referral } from '@accredited-programmes/models'
import type { SystemToken } from '@hmpps-auth'

export default class OasysClient {
  restClient: RestClient

  constructor(systemToken: SystemToken) {
    this.restClient = new RestClient('oasysClient', config.apis.accreditedProgrammesApi as ApiConfig, systemToken)
  }

  async findOffenceDetails(prisonNumber: Referral['prisonNumber']): Promise<Array<OffenceDetail>> {
    return (await this.restClient.get({
      path: apiPaths.oasys.offenceDetails({ prisonNumber }),
    })) as Array<OffenceDetail>
  }
}