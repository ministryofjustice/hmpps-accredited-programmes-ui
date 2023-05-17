import { SuperAgentRequest } from 'superagent'

import paths from '../../server/paths/api'
import { stubFor } from '../../wiremock'
import type { AccreditedProgramme } from '@accredited-programmes/models'

export default {
  stubProgrammes: (programmes: Array<AccreditedProgramme>): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: paths.programmes.index,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: programmes,
      },
    }),
}
