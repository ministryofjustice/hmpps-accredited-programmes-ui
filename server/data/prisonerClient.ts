import RestClient from './restClient'
import type { ApiConfig } from '../config'
import config from '../config'
import { prisonerOffenderSearchPaths } from '../paths'
import type { Prisoner } from '@prisoner-offender-search'

export default class PrisonerClient {
  restClient: RestClient

  constructor(token: Express.User['token']) {
    this.restClient = new RestClient('prisonerClient', config.apis.prisonerOffenderSearch as ApiConfig, token)
  }

  async getPrisoner(prisonNumber: string): Promise<Prisoner> {
    return (await this.restClient.get({
      path: prisonerOffenderSearchPaths.prisoner.show({ prisonNumber }),
    })) as Prisoner
  }
}
