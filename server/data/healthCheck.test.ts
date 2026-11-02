import nock from 'nock'

import { serviceCheckFactory } from './healthCheck'
import { AgentConfig } from '../config'

describe('healthCheck', () => {
  const healthcheck = serviceCheckFactory('externalService', 'http://test-service.com/ping', new AgentConfig(), {
    deadline: 150,
    response: 100,
  })

  let fakeServiceApi: nock.Scope

  beforeEach(() => {
    fakeServiceApi = nock('http://test-service.com')
  })

  afterEach(() => {
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('when healthy', () => {
    it('returns data', async () => {
      fakeServiceApi.get('/ping').reply(200, 'pong')

      const output = await healthcheck()
      expect(output).toEqual('OK')
    })
  })

  describe('when unhealthy', () => {
    it('throws an error', async () => {
      fakeServiceApi.get('/ping').thrice().reply(500)

      await expect(healthcheck()).rejects.toThrow('Internal Server Error')
    })
  })

  describe('when a request fails', () => {
    it('retries twice', async () => {
      fakeServiceApi
        .get('/ping')
        .reply(500, { failure: 'one' })
        .get('/ping')
        .reply(500, { failure: 'two' })
        .get('/ping')
        .reply(200, 'pong')

      const response = await healthcheck()
      expect(response).toEqual('OK')
      expect(fakeServiceApi.isDone()).toBe(true)
    })

    describe('due to a response timeout', () => {
      const pendingReplies: Array<Promise<nock.ReplyFnResult>> = []

      // Nock 15's delay() delays the body, not the response headers.
      function delayedReply(): Promise<nock.ReplyFnResult> {
        const reply = new Promise<nock.ReplyFnResult>(resolve => {
          setTimeout(() => resolve([200, 'pong']), 200)
        })
        pendingReplies.push(reply)
        return reply
      }

      afterEach(async () => {
        await Promise.all(pendingReplies)
        pendingReplies.length = 0
      })

      it('retries twice', async () => {
        fakeServiceApi.get('/ping').twice().reply(delayedReply).get('/ping').reply(200, 'pong')

        const response = await healthcheck()
        expect(response).toEqual('OK')
        expect(fakeServiceApi.isDone()).toBe(true)
      })

      describe('three times', () => {
        it('fails', async () => {
          fakeServiceApi.get('/ping').thrice().reply(delayedReply)

          await expect(healthcheck()).rejects.toThrow('Response timeout of 100ms exceeded')
          expect(fakeServiceApi.isDone()).toBe(true)
        })
      })
    })
  })
})
