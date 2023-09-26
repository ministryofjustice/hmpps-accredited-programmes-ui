import RestClient from './restClient'
import type { ApiConfig } from '../config'
import config from '../config'
import { prisonApiPaths } from '../paths'
import type { Caseload } from '@prison-api'

export default class CaseloadClient {
  restClient: RestClient

  constructor(token: Express.User['token']) {
    this.restClient = new RestClient('caseloadClient', config.apis.prisonApi as ApiConfig, token)
  }

  async findAll(staffId: string): Promise<Array<Caseload>> {
    return (await this.restClient.get({
      path: prisonApiPaths.staff.caseloads.index({ staffId }),
    })) as Array<Caseload>
  }
}
