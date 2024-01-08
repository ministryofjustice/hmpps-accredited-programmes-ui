/* eslint-disable no-console */

import type { ReturnsSuperAgentRequest } from '..'
import { processStubs, stubFor } from '..'
import { prisonerSearchPaths } from '../../server/paths'
import { prisoners } from '../stubs'

const stubs: Array<ReturnsSuperAgentRequest> = []

prisoners.forEach(prisoner => {
  stubs.push(() =>
    stubFor({
      request: {
        bodyPatterns: [
          {
            equalToJson: {
              prisonerIdentifier: prisoner.prisonerNumber,
            },
            ignoreExtraElements: true,
          },
        ],
        method: 'POST',
        url: prisonerSearchPaths.prisoner.searchByCriteria({}),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [prisoner],
        status: 200,
      },
    }),
  )
})

stubs.push(() =>
  stubFor({
    request: {
      method: 'POST',
      url: prisonerSearchPaths.prisoner.searchByPrisonNumbers({}),
    },
    response: {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: prisoners,
      status: 200,
    },
  }),
)

console.log('Stubbing Prisoner Search')
processStubs(stubs)
