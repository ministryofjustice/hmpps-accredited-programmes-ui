import { RestClient } from '@ministryofjustice/hmpps-rest-client'

import logger from '../../logger'
import config from '../config'
import { prisonRegisterApiPaths } from '../paths'
import type { Prison } from '@prison-register-api'

export default class PrisonRegisterApiClient {
  restClient: RestClient

  constructor(private readonly token: Express.User['token']) {
    this.restClient = new RestClient('prisonRegisterApiClient', config.apis.prisonRegisterApi, logger)
  }

  async all(): Promise<Array<Prison>> {
    return (await this.restClient.get({ path: prisonRegisterApiPaths.prisons.all({}) }, this.token)) as Array<Prison>
  }

  async find(prisonId: string): Promise<Prison> {
    return (await this.restClient.get(
      { path: prisonRegisterApiPaths.prisons.show({ prisonId }) },
      this.token,
    )) as Prison
  }
}
