import nock from 'nock'

import RestClient from './restClient'
import { AgentConfig } from '../config'

const restClient = new RestClient(
  'api-name',
  {
    agent: new AgentConfig(1000),
    timeout: {
      deadline: 1000,
      response: 1000,
    },
    url: 'http://localhost:8080/api',
  },
  'token-1',
)

describe.each(['get', 'post', 'put', 'delete'] as const)('Method: %s', method => {
  it('should return response body', async () => {
    nock('http://localhost:8080', {
      reqheaders: { authorization: 'Bearer token-1' },
    })
      [method]('/api/test')
      .reply(200, { success: true })

    const result = await restClient[method]({
      path: '/test',
    })

    expect(nock.isDone()).toBe(true)

    expect(result).toStrictEqual({
      success: true,
    })
  })

  it('should return raw response body', async () => {
    nock('http://localhost:8080', {
      reqheaders: { authorization: 'Bearer token-1' },
    })
      [method]('/api/test')
      .reply(200, { success: true })

    const result = await restClient[method]({
      headers: { header1: 'headerValue1' },
      path: '/test',
      raw: true,
    })

    expect(nock.isDone()).toBe(true)

    expect(result).toMatchObject({
      req: { method: method.toUpperCase() },
      status: 200,
      text: '{"success":true}',
    })
  })

  if (method === 'get' || method === 'delete') {
    it('should retry by default', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token-1' },
      })
        [method]('/api/test')
        .reply(500)
        [method]('/api/test')
        .reply(500)
        [method]('/api/test')
        .reply(500)

      await expect(() =>
        restClient[method]({
          headers: { header1: 'headerValue1' },
          path: '/test',
        }),
      ).rejects.toThrow('Internal Server Error')

      expect(nock.isDone()).toBe(true)
    })

    it('can recover through retries', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token-1' },
      })
        [method]('/api/test')
        .reply(500)
        [method]('/api/test')
        .reply(500)
        [method]('/api/test')
        .reply(200, { success: true })

      const result = await restClient[method]({
        headers: { header1: 'headerValue1' },
        path: '/test',
      })

      expect(result).toStrictEqual({ success: true })
      expect(nock.isDone()).toBe(true)
    })
  } else {
    it('should not retry', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token-1' },
      })
        [method]('/api/test')
        .reply(500)

      await expect(
        restClient[method]({
          headers: { header1: 'headerValue1' },
          path: '/test',
        }),
      ).rejects.toThrow('Internal Server Error')

      expect(nock.isDone()).toBe(true)
    })
  }
})
