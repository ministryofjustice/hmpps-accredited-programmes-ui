import { SuperAgentRequest } from 'superagent'
import type { AccreditedProgramme } from '@accredited-programmes/models'
import { stubFor } from './wiremock'
import paths from '../../server/paths/api'

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
