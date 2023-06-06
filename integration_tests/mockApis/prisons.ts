import type { SuperAgentRequest } from 'superagent'

import paths from '../../server/paths/prisonApi'
import { stubFor } from '../../wiremock'
import type { Prison } from '@prison-api'

export default {
  stubPrison: (prison: Prison): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: paths.prisons.show({ agencyId: prison.agencyId }),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: prison,
      },
    }),
}
