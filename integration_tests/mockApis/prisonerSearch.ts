import type { SuperAgentRequest } from 'superagent'

import { apiPaths } from '../../server/paths'
import { stubFor } from '../../wiremock'
import type { Prisoner } from '@prisoner-search'

export default {
  stubPrisoner: (prisoner: Prisoner | undefined): SuperAgentRequest =>
    stubFor({
      request: {
        bodyPatterns: [
          {
            equalToJson: {
              prisonerIdentifier: prisoner?.prisonerNumber,
            },
            ignoreExtraElements: true,
          },
        ],
        method: 'POST',
        url: apiPaths.prisoner.search({}),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: prisoner ? [prisoner] : [],
        status: 200,
      },
    }),
}
