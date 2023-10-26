import RestClient from './restClient'
import type { ApiConfig } from '../config'
import config from '../config'
import { prisonApiPaths } from '../paths'
import type { SentenceAndOffenceDetails } from '@prison-api'
import type { Prisoner } from '@prisoner-offender-search'

export default class SentenceDetailsClient {
  restClient: RestClient

  constructor(token: Express.User['token']) {
    this.restClient = new RestClient('prisonerClient', config.apis.prisonApi as ApiConfig, token)
  }

  async findSentenceAndOffenceDetails(bookingId: Prisoner['bookingId']): Promise<SentenceAndOffenceDetails> {
    return (await this.restClient.get({
      path: prisonApiPaths.sentenceAndOffenceDetails({ bookingId }),
    })) as SentenceAndOffenceDetails
  }
}
