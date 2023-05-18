import RestClient from './restClient'
import { Prison } from '../@types/prisonApi'
import config, { ApiConfig } from '../config'
import paths from '../paths/prisonApi'

export default class PrisonClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('programmeClient', config.apis.prisonApi as ApiConfig, token)
  }

  async getPrison(agencyId: string): Promise<Prison> {
    return (await this.restClient.get({ path: paths.prisons.show({ agencyId }) })) as Prison
  }
}
