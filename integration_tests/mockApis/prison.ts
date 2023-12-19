import type { SuperAgentRequest } from 'superagent'

import { prisonApiPaths } from '../../server/paths'
import { stubFor } from '../../wiremock'
import { caseloads as defaultCaseloads } from '../../wiremock/stubs'
import type { Caseload, InmateDetail, OffenceDto, OffenderSentenceAndOffences } from '@prison-api'
import type { PrisonerWithBookingId } from '@prisoner-search'

export default {
  stubCaseloads: (caseloads: Array<Caseload>): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: prisonApiPaths.caseloads.currentUser({}),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: caseloads,
        status: 200,
      },
    }),

  stubDefaultCaseloads: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: prisonApiPaths.caseloads.currentUser({}),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: defaultCaseloads,
        status: 200,
      },
    }),

  stubOffenceCode: (offenceCode: OffenceDto): SuperAgentRequest =>
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
      },
    }),

  stubOffenderBooking: (offenderBooking: InmateDetail): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        queryParameters: {
          extraInfo: {
            equalTo: 'true',
          },
        },
        urlPath: prisonApiPaths.offenderBookingDetail({ offenderNo: offenderBooking.offenderNo as string }),
      },
      response: {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: offenderBooking,
        status: 200,
      },
    }),

  stubOffenderSentenceAndOffences: (args: {
    bookingId: PrisonerWithBookingId['bookingId']
    offenderSentenceAndOffences: OffenderSentenceAndOffences
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: prisonApiPaths.offenderSentenceAndOffences({ bookingId: args.bookingId }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.offenderSentenceAndOffences,
        status: 200,
      },
    }),
}
