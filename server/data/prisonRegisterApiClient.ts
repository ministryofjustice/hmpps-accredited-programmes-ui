import RestClient from './restClient'
import type { ApiConfig } from '../config'
import config from '../config'
import { prisonRegisterApiPaths } from '../paths'
import type { Prison } from '@prison-register-api'

export default class PrisonRegisterApiClient {
  restClient: RestClient

  constructor(userToken: Express.User['token']) {
    this.restClient = new RestClient('prisonRegisterApiClient', config.apis.prisonRegisterApi as ApiConfig, userToken)
  }

  async all(): Promise<Array<Prison>> {
    return (await this.restClient.get({ path: prisonRegisterApiPaths.prisons.all({}) })) as Array<Prison>
  }

  async find(prisonId: string): Promise<Prison> {
    return (await this.restClient.get({ path: prisonRegisterApiPaths.prisons.show({ prisonId }) })) as Prison
  }
}
