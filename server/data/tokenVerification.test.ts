import type { Request } from 'express'
import nock from 'nock'

import verifyToken from './tokenVerification'
import config from '../config'

describe('tokenVerification', () => {
  let fakeApi: nock.Scope

  beforeEach(() => {
    config.apis.tokenVerification.url = 'http://localhost:8100'
    fakeApi = nock(config.apis.tokenVerification.url)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('verifyToken', () => {
    describe('when token verification is disabled', () => {
      beforeAll(() => {
        config.apis.tokenVerification.enabled = false
      })

      it("doesn't call the API and returns true", async () => {
        fakeApi.post('/token/verify', '').reply(200, { active: true })
        const verified = await verifyToken({ user: {} } as Request)
        expect(verified).toEqual(true)
        expect(nock.isDone()).toBe(false)
      })
    })

    describe('when token verification is enabled', () => {
      beforeEach(() => {
        config.apis.tokenVerification.enabled = true
      })

      describe('and already verified', () => {
        it("doesn't call the API and returns true", async () => {
          fakeApi.post('/token/verify', '').reply(200, {})
          const verified = await verifyToken({ user: {}, verified: true } as Request)
          expect(verified).toEqual(true)
          expect(nock.isDone()).toBe(false)
        })
      })

      describe('and not already verified', () => {
        describe('and verify returns active', () => {
          it('calls the API and returns true', async () => {
            fakeApi.post('/token/verify', '').reply(200, { active: true })
            const verified = await verifyToken({ user: {}, verified: false } as Request)
            expect(verified).toEqual(true)
            expect(nock.isDone()).toBe(true)
          })
        })

        describe('and verify returns inactive', () => {
          it('calls the API and returns false', async () => {
            fakeApi.post('/token/verify', '').reply(200, { active: false })
            const verified = await verifyToken({ user: {}, verified: false } as Request)
            expect(verified).toEqual(false)
            expect(nock.isDone()).toBe(true)
          })
        })

        describe('and verify returns an empty response', () => {
          it('calls the API and returns false', async () => {
            fakeApi.post('/token/verify', '').reply(200, {})
            const verified = await verifyToken({ user: {}, verified: false } as Request)
            expect(verified).toEqual(false)
            expect(nock.isDone()).toBe(true)
          })
        })
      })
    })
  })
})
