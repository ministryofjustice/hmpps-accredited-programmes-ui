import type { ApiConfig } from '../../config'
import config from '../../config'
import { apiPaths } from '../../paths'
import RestClient from '../restClient'
import type { SentenceDetails } from '@accredited-programmes/models'
import type { PeopleSearchResponse } from '@accredited-programmes-api'
import type { SystemToken } from '@hmpps-auth'
import type { Caseload } from '@prison-api'

export default class PersonClient {
  restClient: RestClient

  constructor(systemToken: SystemToken) {
    this.restClient = new RestClient('personClient', config.apis.accreditedProgrammesApi as ApiConfig, systemToken)
  }

  async findPrisoner(
    prisonNumber: PeopleSearchResponse['prisonerNumber'],
    caseloadIds?: Array<Caseload['caseLoadId']>,
  ): Promise<PeopleSearchResponse | null> {
    const prisoners: Array<PeopleSearchResponse> = (await this.restClient.post({
      data: {
        prisonIds: caseloadIds,
        prisonerIdentifier: prisonNumber,
      },
      path: apiPaths.person.prisonerSearch({}),
    })) as Array<PeopleSearchResponse>

    if (!prisoners.length) {
      return null
    }

    return prisoners[0]
  }

  async findSentenceDetails(prisonNumber: PeopleSearchResponse['prisonerNumber']): Promise<SentenceDetails> {
    return (await this.restClient.get({
      path: apiPaths.person.prisonerSentences({ prisonNumber }),
    })) as SentenceDetails
  }
}
