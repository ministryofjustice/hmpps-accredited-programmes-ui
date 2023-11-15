import RestClient from './restClient'
import type { ApiConfig } from '../config'
import config from '../config'
import { prisonerSearchPaths } from '../paths'
import type { SystemToken } from '@hmpps-auth'
import type { Caseload } from '@prison-api'
import type { Prisoner } from '@prisoner-search'

export default class PrisonerSearchClient {
  restClient: RestClient

  constructor(systemToken: SystemToken) {
    this.restClient = new RestClient('prisonerSearchClient', config.apis.prisonerSearch as ApiConfig, systemToken)
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
