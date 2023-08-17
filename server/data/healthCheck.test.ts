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
    })

    describe('due to timeout', () => {
      it('retries twice', async () => {
        fakeServiceApi
          .get('/ping')
          .delay(10000) // delay set to 10s, timeout to 900/3=300ms
          .reply(200, { failure: 'one' })
          .get('/ping')
          .delay(10000)
          .reply(200, { failure: 'two' })
          .get('/ping')
          .reply(200, 'pong')

        const response = await healthcheck()
        expect(response).toEqual('OK')
      })

      describe('three times', () => {
        it('fails', async () => {
          fakeServiceApi
            .get('/ping')
            .delay(10000) // delay set to 10s, timeout to 900/3=300ms
            .reply(200, { failure: 'one' })
            .get('/ping')
            .delay(10000)
            .reply(200, { failure: 'two' })
            .get('/ping')
            .delay(10000)
            .reply(200, { failure: 'three' })

          await expect(healthcheck()).rejects.toThrow('Response timeout of 100ms exceeded')
        })
      })
    })
  })
})
