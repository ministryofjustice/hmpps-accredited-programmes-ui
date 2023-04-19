import config, { ApiConfig } from '../config'
import RestClient from './restClient'
import paths from '../paths/api'
import { AccreditedProgramme } from '../@types/shared/models/AccreditedProgramme'

export default class ProgrammeClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('programmeClient', config.apis.accreditedProgrammesApi as ApiConfig, token)
  }

  async all(): Promise<Array<AccreditedProgramme>> {
    return (await this.restClient.get({ path: paths.programmes.index({}) })) as Array<AccreditedProgramme>
  }
}
