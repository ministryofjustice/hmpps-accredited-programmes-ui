import type { SuperAgentRequest } from 'superagent'

import { apiPaths } from '../../server/paths'
import { stubFor } from '../../wiremock'
import type { SentenceDetails } from '@accredited-programmes/models'
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
        url: apiPaths.person.prisonerSearch({}),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: prisoner ? [prisoner] : [],
        status: 200,
      },
    }),

  stubSentenceDetails: (args: { prisonNumber: string; sentenceDetails: SentenceDetails }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.person.prisonerSentences({ prisonNumber: args.prisonNumber }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.sentenceDetails,
        status: 200,
      },
    }),
}
