/* eslint-disable no-console */

import { stubFor } from '..'
import { prisonerSearchPaths } from '../../server/paths'
import { prisoners } from '../stubs'

prisoners.forEach(async prisoner => {
  const response = await stubFor({
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
      url: prisonerSearchPaths.prisoner.search({}),
    },

    response: {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: [prisoner],
      status: 200,
    },
  })

  console.log(`Stubbed ${response.body.request.method} ${response.body.request.url}`)
})

stubFor({
  request: {
    method: 'POST',
    urlPattern: '/prisoner-search/prisoner-numbers',
  },
  response: {
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: prisoners,
    status: 200,
  },
}).then(response => {
  console.log(`Stubbed ${response.body.request.method} ${response.body.request.url}`)
})
