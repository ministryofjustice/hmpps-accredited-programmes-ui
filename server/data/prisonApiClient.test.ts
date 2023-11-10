import nock from 'nock'

import PrisonApiClient from './prisonApiClient'
import config from '../config'
import { prisonApiPaths } from '../paths'
import {
  caseloadFactory,
  offenceHistory,
  prisonerFactory,
  sentenceAndOffenceDetailsFactory,
} from '../testutils/factories'
import type { Caseload, InmateDetail } from '@prison-api'
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

  describe('findOffender', () => {
    const offenderNo = 'A1234AA'
    const offender: InmateDetail = {
      offenceHistory: [offenceHistory.build(), offenceHistory.build({ mostSerious: true })],
      offenderNo,
    }

    it('fetches an offender by offender number', async () => {
      fakePrisonApi.get(prisonApiPaths.offender({ offenderNo })).query({ extraInfo: 'true' }).reply(200, offender)

      const output = await prisonApiClient.findOffender(offenderNo)
      expect(output).toEqual(offender)
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
