/* istanbul ignore file */
import config, { type ApiConfig } from '../../config'
import { apiPaths } from '../../paths'
import RestClient from '../restClient'
import type { OffenceDetail, Referral, RoshAnalysis } from '@accredited-programmes/models'
import type { SystemToken } from '@hmpps-auth'

export default class OasysClient {
  restClient: RestClient

  constructor(systemToken: SystemToken) {
    this.restClient = new RestClient('oasysClient', config.apis.accreditedProgrammesApi as ApiConfig, systemToken)
  }

  async findOffenceDetails(prisonNumber: Referral['prisonNumber']): Promise<OffenceDetail> {
    return (await this.restClient.get({
      path: apiPaths.oasys.offenceDetails({ prisonNumber }),
    })) as OffenceDetail
  }

  async findRoshAnalysis(prisonNumber: Referral['prisonNumber']): Promise<RoshAnalysis> {
    return (await this.restClient.get({
      path: apiPaths.oasys.roshAnalysis({ prisonNumber }),
    })) as RoshAnalysis
  }
}
