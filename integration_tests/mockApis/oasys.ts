import type { SuperAgentRequest } from 'superagent'

import { apiPaths } from '../../server/paths'
import { stubFor } from '../../wiremock'
import type { OffenceDetail, Referral } from '@accredited-programmes/models'

export default {
  stubOffenceDetails: (args: {
    offenceDetail: OffenceDetail
    prisonNumber: Referral['prisonNumber']
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.oasys.offenceDetails({ prisonNumber: args.prisonNumber }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.offenceDetail,
        status: 200,
      },
    }),
}
