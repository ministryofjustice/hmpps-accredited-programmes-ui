import type { SuperAgentRequest } from 'superagent'

import { prisonApiPaths } from '../../server/paths'
import { stubFor } from '../../wiremock'
import { caseloads as defaultCaseloads } from '../../wiremock/stubs'
import type { Caseload } from '@prison-api'

export default {
  stubCaseloads: (caseloads: Array<Caseload>): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: prisonApiPaths.users.current.caseloads({}),
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
        url: prisonApiPaths.users.current.caseloads({}),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          caseloads: defaultCaseloads,
        },
        status: 200,
      },
    }),
}
