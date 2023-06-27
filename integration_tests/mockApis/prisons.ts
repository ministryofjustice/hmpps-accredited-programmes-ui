import type { SuperAgentRequest } from 'superagent'

import { prisonRegisterApiPaths } from '../../server/paths'
import { stubFor } from '../../wiremock'
import type { Prison } from '@prison-register-api'

export default {
  stubPrison: (prison: Prison): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: prisonRegisterApiPaths.prisons.show({ prisonId: prison.prisonId }),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: prison,
      },
    }),
}
