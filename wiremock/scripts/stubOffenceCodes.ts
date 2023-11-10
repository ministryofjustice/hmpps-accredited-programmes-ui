/* eslint-disable no-console */

import { stubFor } from '..'
import { prisonApiPaths } from '../../server/paths'
import { offenceCodes } from '../stubs'

offenceCodes.forEach(async offenceCode => {
  const response = await stubFor({
    request: {
      method: 'GET',
      url: prisonApiPaths.offenceCode({ offenceCode: offenceCode.code }),
    },
    response: {
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {
        content: [offenceCode],
      },
      status: 200,
    },
  })

  console.log(`Stubbed ${response.body.request.method} ${response.body.request.url}`)
})
