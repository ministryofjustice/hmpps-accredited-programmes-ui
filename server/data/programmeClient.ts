import type { AccreditedProgramme } from '@accredited-programmes/models'
import config, { ApiConfig } from '../config'
import RestClient from './restClient'
import paths from '../paths/api'

export default class ProgrammeClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('programmeClient', config.apis.accreditedProgrammesApi as ApiConfig, token)
  }

  async all(): Promise<Array<AccreditedProgramme>> {
    return (await this.restClient.get({ path: paths.programmes.index({}) })) as Array<AccreditedProgramme>
  }
}
