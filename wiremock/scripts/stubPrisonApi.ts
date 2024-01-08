/* eslint-disable no-console */

import type { ReturnsSuperAgentRequest } from '..'
import { processStubs, stubFor } from '..'
import { prisonApiPaths } from '../../server/paths'
import { caseloads, offenceCodes, offenderBookings, offenderSentenceAndOffences, prisoners } from '../stubs'

const stubs: Array<ReturnsSuperAgentRequest> = []

stubs.push(() =>
  stubFor({
    request: {
      method: 'GET',
      url: prisonApiPaths.caseloads.currentUser({}),
    },
    response: {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: caseloads,
      status: 200,
    },
  }),
)

offenceCodes.forEach(offenceCode => {
  stubs.push(() =>
    stubFor({
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
    }),
  )
})

offenderBookings.forEach(offenderBooking => {
  stubs.push(() =>
    stubFor({
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
    }),
  )
})

prisoners.forEach(prisoner => {
  stubs.push(() =>
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
    }),
  )
})

console.log('Stubbing Prison API')
processStubs(stubs)
