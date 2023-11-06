import RestClient from './restClient'
import type { ApiConfig } from '../config'
import config from '../config'
import { prisonerSearchPaths } from '../paths'
import type { Caseload } from '@prison-api'
import type { Prisoner } from '@prisoner-search'

export default class PrisonerClient {
  restClient: RestClient

  constructor(token: Express.User['token']) {
    this.restClient = new RestClient('prisonerClient', config.apis.prisonerSearch as ApiConfig, token)
  }

  async find(
    prisonNumber: Prisoner['prisonerNumber'],
    caseloadIds: Array<Caseload['caseLoadId']>,
  ): Promise<Prisoner | null> {
    const prisoners: Array<Prisoner> = (await this.restClient.post({
      data: {
        prisonIds: caseloadIds,
        prisonerIdentifier: prisonNumber,
      },
      path: prisonerSearchPaths.prisoner.search({}),
    })) as Array<Prisoner>

    if (!prisoners.length) {
      return null
    }
    return prisoners[0]
  }
}
