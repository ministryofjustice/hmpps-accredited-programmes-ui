import nock from 'nock'

import PrisonerSearchClient from './prisonerSearchClient'
import config from '../../config'
import { apiPaths } from '../../paths'
import { prisonerFactory } from '../../testutils/factories'
import type { Prisoner } from '@prisoner-search'

describe('PrisonerSearchClient', () => {
  let fakePrisonerSearch: nock.Scope
  let prisonerSearchClient: PrisonerSearchClient

  const systemToken = 'token-1'

  beforeEach(() => {
    fakePrisonerSearch = nock(config.apis.accreditedProgrammesApi.url)
    prisonerSearchClient = new PrisonerSearchClient(systemToken)
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
      fakePrisonerSearch
        .post(apiPaths.prisoner.search({}))
        .matchHeader('authorization', `Bearer ${systemToken}`)
        .reply(200, [prisoner])

      const output = await prisonerSearchClient.find(prisoner.prisonerNumber, ['BXI', 'MDI'])
      expect(output).toEqual(prisoner)
    })

    describe('when no prisoner is found', () => {
      it('returns null', async () => {
        fakePrisonerSearch
          .post(apiPaths.prisoner.search({}))
          .matchHeader('authorization', `Bearer ${systemToken}`)
          .reply(200, [])

        const output = await prisonerSearchClient.find(prisoner.prisonerNumber, ['BXI', 'MDI'])
        expect(output).toEqual(null)
      })
    })
  })
})
