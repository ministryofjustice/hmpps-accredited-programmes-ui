import nock from 'nock'

import CaseloadClient from './caseloadClient'
import config from '../config'
import { prisonApiPaths } from '../paths'
import { caseloadFactory } from '../testutils/factories'
import type { Caseload } from '@prison-api'

describe('caseloadClient', () => {
  let fakePrisonApi: nock.Scope
  let caseloadClient: CaseloadClient

  const token = 'token-1'

  beforeEach(() => {
    fakePrisonApi = nock(config.apis.prisonApi.url)
    caseloadClient = new CaseloadClient(token)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('findAll', () => {
    const staffId = '123123'
    const caseloads: Array<Caseload> = [caseloadFactory.active().build(), caseloadFactory.inactive().build()]

    it('fetches all Caseloads for the given staff ID', async () => {
      fakePrisonApi
        .get(prisonApiPaths.staff.caseloads.index({ staffId }))
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, caseloads)

      const output = await caseloadClient.findAll(staffId)
      expect(output).toEqual(caseloads)
    })
  })
})
