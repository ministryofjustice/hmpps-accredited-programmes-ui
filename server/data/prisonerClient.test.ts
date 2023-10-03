import nock from 'nock'

import PrisonerClient from './prisonerClient'
import config from '../config'
import { prisonerOffenderSearchPaths } from '../paths'
import { prisonerFactory } from '../testutils/factories'
import type { Prisoner } from '@prisoner-offender-search'

describe('PrisonerClient', () => {
  let fakePrisonerOffenderSearch: nock.Scope
  let prisonerClient: PrisonerClient

  const token = 'token-1'

  beforeEach(() => {
    fakePrisonerOffenderSearch = nock(config.apis.prisonerOffenderSearch.url)
    prisonerClient = new PrisonerClient(token)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('find', () => {
    const prisoner: Prisoner = prisonerFactory.build()

    it('searches for a prisoner by prison number and caseload IDs and returns the first match on the assumption that there will never be multiple matches', async () => {
      fakePrisonerOffenderSearch
        .post(prisonerOffenderSearchPaths.prisoner.search({}))
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, [prisoner])

      const output = await prisonerClient.find(prisoner.prisonerNumber, ['BXI', 'MDI'])
      expect(output).toEqual(prisoner)
    })

    describe('when no prisoner is found', () => {
      it('returns null', async () => {
        fakePrisonerOffenderSearch
          .post(prisonerOffenderSearchPaths.prisoner.search({}))
          .matchHeader('authorization', `Bearer ${token}`)
          .reply(200, [])

        const output = await prisonerClient.find(prisoner.prisonerNumber, ['BXI', 'MDI'])
        expect(output).toEqual(null)
      })
    })
  })
})
