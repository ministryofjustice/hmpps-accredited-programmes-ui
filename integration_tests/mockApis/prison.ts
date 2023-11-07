import type { SuperAgentRequest } from 'superagent'

import { prisonApiPaths } from '../../server/paths'
import { stubFor } from '../../wiremock'
import { caseloads as defaultCaseloads } from '../../wiremock/stubs'
import type { Caseload, SentenceAndOffenceDetails } from '@prison-api'
import type { Prisoner } from '@prisoner-search'

export default {
  stubCaseloads: (caseloads: Array<Caseload>): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: prisonApiPaths.caseloads.currentUser({}),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: caseloads,
        status: 200,
      },
    }),

  stubDefaultCaseloads: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: prisonApiPaths.caseloads.currentUser({}),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: defaultCaseloads,
        status: 200,
      },
    }),

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
