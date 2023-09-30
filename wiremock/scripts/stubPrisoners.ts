/* eslint-disable no-console */

import { stubFor } from '..'
import { prisonerOffenderSearchPaths } from '../../server/paths'
import { prisoners } from '../stubs'

prisoners.forEach(async prisoner => {
  const response = await stubFor({
    request: {
      method: 'POST',
      url: prisonerOffenderSearchPaths.prisoner.search({}),
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
