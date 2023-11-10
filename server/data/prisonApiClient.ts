import RestClient from './restClient'
import type { ApiConfig } from '../config'
import config from '../config'
import { prisonApiPaths } from '../paths'
import type { Caseload, OffenderSentenceAndOffences } from '@prison-api'
import type { Prisoner } from '@prisoner-search'

export default class PrisonApiClient {
  restClient: RestClient

  constructor(token: Express.User['token']) {
    this.restClient = new RestClient('prisonApiClient', config.apis.prisonApi as ApiConfig, token)
  }

  async findCurrentUserCaseloads(): Promise<Array<Caseload>> {
    return (await this.restClient.get({
      path: prisonApiPaths.caseloads.currentUser({}),
    })) as Array<Caseload>
  }

  async findSentenceAndOffenceDetails(bookingId: Prisoner['bookingId']): Promise<OffenderSentenceAndOffences> {
    return (await this.restClient.get({
      path: prisonApiPaths.sentenceAndOffenceDetails({ bookingId }),
    })) as OffenderSentenceAndOffences
  }
}
