/* eslint-disable no-console */

import { stubFor } from '..'
import { prisonApiPaths } from '../../server/paths'
import { offenderBookings } from '../stubs'

offenderBookings.forEach(async offenderBooking => {
  const response = await stubFor({
    request: {
      method: 'GET',
      queryParameters: {
        extraInfo: {
          equalTo: 'true',
        },
      },
      urlPath: prisonApiPaths.offenderBookingDetail({ offenderNo: offenderBooking.offenderNo }),
    },
    response: {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: offenderBooking,
      status: 200,
    },
  })

  console.log(`Stubbed ${response.body.request.method} ${response.body.request.url}`)
})
