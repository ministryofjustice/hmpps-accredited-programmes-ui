import type { SuperAgentRequest } from 'superagent'

import { prisonApiPaths } from '../../server/paths'
import { stubFor } from '../../wiremock'
import { caseloads as defaultCaseloads } from '../../wiremock/stubs'
import type { Caseload, OffenderSentenceAndOffences } from '@prison-api'
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

  stubOffenderSentenceAndOffences: (args: {
    bookingId: Prisoner['bookingId']
    offenderSentenceAndOffences: OffenderSentenceAndOffences
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: prisonApiPaths.offenderSentenceAndOffences({ bookingId: args.bookingId }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.offenderSentenceAndOffences,
        status: 200,
      },
    }),
}
