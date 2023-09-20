import RestClient from './restClient'
import type { ApiConfig } from '../config'
import config from '../config'
import { prisonRegisterApiPaths } from '../paths'
import type { Prison } from '@prison-register-api'

export default class PrisonClient {
  restClient: RestClient

  constructor(token: Express.User['token']) {
    this.restClient = new RestClient('prisonClient', config.apis.prisonRegisterApi as ApiConfig, token)
  }

  async find(prisonId: string): Promise<Prison> {
    return (await this.restClient.get({ path: prisonRegisterApiPaths.prisons.show({ prisonId }) })) as Prison
  }
}
