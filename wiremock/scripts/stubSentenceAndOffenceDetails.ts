/* eslint-disable no-console */

import { stubFor } from '..'
import { prisonApiPaths } from '../../server/paths'
import { prisoners, sentenceAndOffenceDetails } from '../stubs'

prisoners.forEach(prisoner => {
  stubFor({
    request: {
      method: 'GET',
      url: prisonApiPaths.sentenceAndOffenceDetails({ bookingId: prisoner.bookingId }),
    },
    response: {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: sentenceAndOffenceDetails,
      status: 200,
    },
  }).then(response => {
    console.log(`Stubbed ${response.body.request.method} ${response.body.request.url}`)
  })
})
