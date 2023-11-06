import type { SuperAgentRequest } from 'superagent'

import { prisonApiPaths } from '../../server/paths'
import { stubFor } from '../../wiremock'
import type { SentenceAndOffenceDetails } from '@prison-api'
import type { Prisoner } from '@prisoner-search'

export default {
  stubSentenceAndOffenceDetails: (args: {
    bookingId: Prisoner['bookingId']
    sentenceAndOffenceDetails: SentenceAndOffenceDetails
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: prisonApiPaths.sentenceAndOffenceDetails({ bookingId: args.bookingId }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.sentenceAndOffenceDetails,
        status: 200,
      },
    }),
}
