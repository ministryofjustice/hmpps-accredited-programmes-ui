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

  async allByCurrentUser(): Promise<Array<Caseload>> {
    return (await this.restClient.get({
      path: prisonApiPaths.users.current.caseloads({}),
    })) as Array<Caseload>
  }
}
