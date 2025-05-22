import type { SuperAgentRequest } from 'superagent'

import { apiPaths } from '../../server/paths'
import { stubFor } from '../../wiremock'
import type { Organisation } from '@accredited-programmes-api'

export default {
  stubOrganisation: (organisation: Organisation): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.organisations.show({ organisationCode: organisation.code! }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: organisation,
        status: 200,
      },
    }),
}
