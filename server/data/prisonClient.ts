import RestClient from './restClient'
import type { ApiConfig } from '../config'
import config from '../config'
import prisonRegisterApiPaths from '../paths/prisonRegisterApi'
import type { Prison } from '@prison-register-api'

export default class PrisonClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('prisonClient', config.apis.prisonRegisterApi as ApiConfig, token)
  }

  async getPrison(prisonId: string): Promise<Prison> {
    return (await this.restClient.get({ path: prisonRegisterApiPaths.prisons.show({ prisonId }) })) as Prison
  }
}
