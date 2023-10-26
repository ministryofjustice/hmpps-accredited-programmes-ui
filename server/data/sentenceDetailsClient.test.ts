import nock from 'nock'

import SentenceAndOffenceDetailsClient from './sentenceDetailsClient'
import config from '../config'
import { prisonApiPaths } from '../paths'
import { prisonerFactory, sentenceAndOffenceDetailsFactory } from '../testutils/factories'
import type { Prisoner } from '@prisoner-offender-search'

describe('SentenceDetailsClient', () => {
  let fakePrisonApi: nock.Scope
  let sentenceAndOffenceDetailsClient: SentenceAndOffenceDetailsClient

  const token = 'token-1'

  beforeEach(() => {
    fakePrisonApi = nock(config.apis.prisonApi.url)
    sentenceAndOffenceDetailsClient = new SentenceAndOffenceDetailsClient(token)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('findSentenceAndOffenceDetails', () => {
    const prisoner: Prisoner = prisonerFactory.build()
    const sentenceAndOffenceDetails = sentenceAndOffenceDetailsFactory.build()

    it("searches for a prisoner's sentence and offence details by booking ID", async () => {
      fakePrisonApi
        .get(prisonApiPaths.sentenceAndOffenceDetails({ bookingId: prisoner.bookingId }))
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, sentenceAndOffenceDetails)

      const output = await sentenceAndOffenceDetailsClient.findSentenceAndOffenceDetails(prisoner.bookingId)
      expect(output).toEqual(sentenceAndOffenceDetails)
    })
  })
})
