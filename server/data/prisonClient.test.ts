import nock from 'nock'

import PrisonClient from './prisonClient'
import config from '../config'
import prisonFactory from '../testutils/factories/prison'
import type { Prison } from '@prison-api'

describe('PrisonClient', () => {
  let fakePrisonApi: nock.Scope
  let prisonClient: PrisonClient

  const token = 'token-1'

  beforeEach(() => {
    fakePrisonApi = nock(config.apis.prisonApi.url)
    prisonClient = new PrisonClient(token)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('getPrison', () => {
    const prison: Prison = prisonFactory.build()

    it('should get a Prison by its `agencyId`', async () => {
      fakePrisonApi
        .get(`/api/agencies/prison/${prison.agencyId}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, prison)

      const output = await prisonClient.getPrison(prison.agencyId)
      expect(output).toEqual(prison)
    })
  })
})
