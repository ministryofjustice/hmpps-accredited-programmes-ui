import type { SuperAgentRequest } from 'superagent'

import { prisonerOffenderSearchPaths } from '../../server/paths'
import { stubFor } from '../../wiremock'
import type { Prisoner } from '@prisoner-offender-search'

export default {
  stubPrisoner: (prisoner: Prisoner): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: prisonerOffenderSearchPaths.prisoner.show({ prisonNumber: prisoner.prisonerNumber }),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: prisoner,
      },
    }),
}
