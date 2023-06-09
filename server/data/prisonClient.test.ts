import type { HttpError } from 'http-errors'
import createError from 'http-errors'
import nock from 'nock'

import PrisonClient from './prisonClient'
import config from '../config'
import { prisonFactory } from '../testutils/factories'
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
    describe('when the prison is found', () => {
      const prison: Prison = prisonFactory.build()

      it('returns the Prison with the matching `agencyId`', async () => {
        fakePrisonApi
          .get(`/api/agencies/prison/${prison.agencyId}`)
          .matchHeader('authorization', `Bearer ${token}`)
          .reply(200, prison)

        const output = await prisonClient.getPrison(prison.agencyId)
        expect(output).toEqual(prison)
      })
    })

    describe('when the prison is not found', () => {
      it('return `null`', async () => {
        const notFoundPrisonId = 'NOT-FOUND'

        fakePrisonApi
          .get(`/api/agencies/prison/${notFoundPrisonId}`)
          .matchHeader('authorization', `Bearer ${token}`)
          .reply(404)

        const output = await prisonClient.getPrison(notFoundPrisonId)
        expect(output).toEqual(null)
      })
    })

    describe('when there is some other error', () => {
      it('re-raises an error', async () => {
        const otherErrorPrisonId = 'OTHER-ERROR'

        fakePrisonApi.get(`/api/agencies/prison/${otherErrorPrisonId}`).replyWithError(createError(500))

        try {
          await prisonClient.getPrison(otherErrorPrisonId)
        } catch (error) {
          const knownError = error as HttpError

          expect(knownError.status).toEqual(500)
          expect(knownError.userMessage).toEqual('Could not get prison from Prison API.')
        }
      })
    })
  })
})
