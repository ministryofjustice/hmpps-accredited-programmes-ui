import nock from 'nock'

import PrisonApiClient from './prisonApiClient'
import config from '../config'
import { prisonApiPaths } from '../paths'
import {
  caseloadFactory,
  inmateDetailFactory,
  prisonerFactory,
  sentenceAndOffenceDetailsFactory,
} from '../testutils/factories'
import type { Caseload } from '@prison-api'
import type { Prisoner } from '@prisoner-search'

describe('PrisonApiClient', () => {
  let fakePrisonApi: nock.Scope
  let prisonApiClient: PrisonApiClient

  const token = 'token-1'

  beforeEach(() => {
    fakePrisonApi = nock(config.apis.prisonApi.url)
    prisonApiClient = new PrisonApiClient(token)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('findCurrentUserCaseloads', () => {
    const caseloads: Array<Caseload> = [caseloadFactory.active().build(), caseloadFactory.inactive().build()]

    it('fetches all Caseloads for the logged in user', async () => {
      fakePrisonApi
        .get(prisonApiPaths.caseloads.currentUser({}))
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, caseloads)

      const output = await prisonApiClient.findCurrentUserCaseloads()
      expect(output).toEqual(caseloads)
    })
  })

  describe('findOffenderBookingByOffenderNo', () => {
    const offenderNo = 'A1234AA'
    const offenderBooking = inmateDetailFactory.build()

    it('fetches an offender booking by offender number', async () => {
      fakePrisonApi
        .get(prisonApiPaths.offenderBookingDetail({ offenderNo }))
        .query({ extraInfo: 'true' })
        .reply(200, offenderBooking)

      const output = await prisonApiClient.findOffenderBookingByOffenderNo(offenderNo)
      expect(output).toEqual(offenderBooking)
    })
  })

  describe('findSentenceAndOffenceDetails', () => {
    const prisoner: Prisoner = prisonerFactory.build()
    const sentenceAndOffenceDetails = sentenceAndOffenceDetailsFactory.build()

    it("searches for a prisoner's sentence and offence details by booking ID", async () => {
      fakePrisonApi
        .get(prisonApiPaths.sentenceAndOffenceDetails({ bookingId: prisoner.bookingId }))
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, sentenceAndOffenceDetails)

      const output = await prisonApiClient.findSentenceAndOffenceDetails(prisoner.bookingId)
      expect(output).toEqual(sentenceAndOffenceDetails)
    })
  })
})
