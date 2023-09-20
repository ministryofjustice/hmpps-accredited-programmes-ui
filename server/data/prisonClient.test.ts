import nock from 'nock'

import PrisonClient from './prisonClient'
import config from '../config'
import { prisonFactory } from '../testutils/factories'
import type { Prison } from '@prison-register-api'

describe('PrisonClient', () => {
  let fakePrisonRegisterApi: nock.Scope
  let prisonClient: PrisonClient

  const token = 'token-1'

  beforeEach(() => {
    fakePrisonRegisterApi = nock(config.apis.prisonRegisterApi.url)
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

  describe('find', () => {
    const prison: Prison = prisonFactory.build()

    it('fetches the given prison', async () => {
      fakePrisonRegisterApi
        .get(`/prisons/id/${prison.prisonId}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, prison)

      const output = await prisonClient.find(prison.prisonId)
      expect(output).toEqual(prison)
    })
  })
})
