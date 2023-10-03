import RestClient from './restClient'
import type { ApiConfig } from '../config'
import config from '../config'
import { prisonerOffenderSearchPaths } from '../paths'
import type { Caseload } from '@prison-api'
import type { Prisoner } from '@prisoner-offender-search'

export default class PrisonerClient {
  restClient: RestClient

  constructor(token: Express.User['token']) {
    this.restClient = new RestClient('prisonerClient', config.apis.prisonerOffenderSearch as ApiConfig, token)
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
      path: prisonerOffenderSearchPaths.prisoner.search({}),
    })) as Array<Prisoner>

    if (!prisoners.length) {
      return null
    }
    return prisoners[0]
  }
}
