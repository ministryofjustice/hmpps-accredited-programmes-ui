/* eslint-disable no-console */

import { stubFor } from '..'
import { prisonApiPaths } from '../../server/paths'
import { offenderSentenceAndOffences, prisoners } from '../stubs'

prisoners.forEach(prisoner => {
  stubFor({
    request: {
      method: 'GET',
      url: prisonApiPaths.offenderSentenceAndOffences({ bookingId: prisoner.bookingId }),
    },
    response: {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: offenderSentenceAndOffences,
      status: 200,
    },
  }).then(response => {
    console.log(`Stubbed ${response.body.request.method} ${response.body.request.url}`)
  })
})
