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
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        content: [offenceCode],
        empty: false,
        first: true,
        last: true,
        number: 0,
        numberOfElements: 1,
        pageable: {
          offset: 0,
          pageNumber: 0,
          pageSize: 10,
          paged: true,
          sort: {
            empty: false,
            sorted: true,
            unsorted: false,
          },
          unpaged: false,
        },
        size: 10,
        sort: {
          empty: false,
          sorted: true,
          unsorted: false,
        },
        totalElements: 1,
        totalPages: 1,
      },
      status: 200,
    },
  })

  console.log(`Stubbed ${response.body.request.method} ${response.body.request.url}`)
})
