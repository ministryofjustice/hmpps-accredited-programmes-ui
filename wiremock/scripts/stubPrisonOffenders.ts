/* eslint-disable no-console */

import { stubFor } from '..'
import { prisonApiPaths } from '../../server/paths'
import { prisonOffenders } from '../stubs'

prisonOffenders.forEach(async prisoner => {
  const response = await stubFor({
    request: {
      method: 'GET',
      queryParameters: {
        extraInfo: {
          equalTo: 'true',
        },
        fullInfo: {
          equalTo: 'true',
        },
      },
      urlPath: prisonApiPaths.offender({ offenderNo: prisoner.offenderNo }),
    },

    response: {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: prisoner,
      status: 200,
    },
  })

  console.log(`Stubbed ${response.body.request.method} ${response.body.request.url}`)
})
