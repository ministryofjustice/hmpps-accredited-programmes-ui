import RestClient from './restClient'
import type { ApiConfig } from '../config'
import config from '../config'
import paths from '../paths/prisonApi'
import type { Prison } from '@prison-api'

export default class PrisonClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('prisonClient', config.apis.prisonApi as ApiConfig, token)
  }

  async getPrison(agencyId: string): Promise<Prison> {
    return (await this.restClient.get({ path: paths.prisons.show({ agencyId }) })) as Prison
  }
}
