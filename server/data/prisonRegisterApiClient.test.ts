import nock from 'nock'

import PrisonRegisterApiClient from './prisonRegisterApiClient'
import config from '../config'
import { prisonFactory } from '../testutils/factories'
import type { Prison } from '@prison-register-api'

describe('PrisonRegisterApiClient', () => {
  let fakePrisonRegisterApi: nock.Scope
  let prisonRegisterApiClient: PrisonRegisterApiClient

  const userToken = 'token-1'

  beforeEach(() => {
    fakePrisonRegisterApi = nock(config.apis.prisonRegisterApi.url)
    prisonRegisterApiClient = new PrisonRegisterApiClient(userToken)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('all', () => {
    const prisons: Array<Prison> = prisonFactory.buildList(3)

    it('fetches all prisons', async () => {
      fakePrisonRegisterApi.get('/prisons').matchHeader('authorization', `Bearer ${userToken}`).reply(200, prisons)

      const output = await prisonRegisterApiClient.all()
      expect(output).toEqual(prisons)
    })
  })

  describe('find', () => {
    const prison: Prison = prisonFactory.build()

    it('fetches the given prison', async () => {
      fakePrisonRegisterApi
        .get(`/prisons/id/${prison.prisonId}`)
        .matchHeader('authorization', `Bearer ${userToken}`)
        .reply(200, prison)

      const output = await prisonRegisterApiClient.find(prison.prisonId)
      expect(output).toEqual(prison)
    })
  })
})
