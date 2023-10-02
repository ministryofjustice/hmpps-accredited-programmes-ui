/* eslint-disable no-console */

import { stubFor } from '..'
import { prisonApiPaths } from '../../server/paths'
import { caseloads } from '../stubs'

stubFor({
  request: {
    method: 'GET',
    url: prisonApiPaths.users.current.caseloads({}),
  },
  response: {
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: caseloads,
    status: 200,
  },
}).then(response => {
  console.log(`Stubbed ${response.body.request.method} ${response.body.request.url}`)
})
