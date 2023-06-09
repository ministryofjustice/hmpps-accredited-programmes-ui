import { createMock } from '@golevelup/ts-jest'
import nock from 'nock'

import HmppsAuthClient from './hmppsAuthClient'
import type { RedisClient } from './redisClient'
import TokenStore from './tokenStore'
import config from '../config'

jest.mock('./tokenStore')
jest.mock('./redisClient')

const redisClient = createMock<RedisClient>({})
const tokenStore = new TokenStore(redisClient) as jest.Mocked<TokenStore>

const username = 'Bob'
const token = { access_token: 'token-1', expires_in: 300 }

describe('hmppsAuthClient', () => {
  let fakeHmppsAuthApi: nock.Scope
  let hmppsAuthClient: HmppsAuthClient

  beforeEach(() => {
    fakeHmppsAuthApi = nock(config.apis.hmppsAuth.url)
    hmppsAuthClient = new HmppsAuthClient(tokenStore)
    tokenStore.getToken.mockResolvedValue(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getUser', () => {
    it('returns data from the API', async () => {
      const response = { data: 'data' }

      fakeHmppsAuthApi
        .get('/api/user/me')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, response)

      const output = await hmppsAuthClient.getUser(token.access_token)
      expect(output).toEqual(response)
    })
  })

  describe('getUserRoles', () => {
    it('returns data from the API', async () => {
      fakeHmppsAuthApi
        .get('/api/user/me/roles')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, [{ roleCode: 'role1' }, { roleCode: 'role2' }])

      const output = await hmppsAuthClient.getUserRoles(token.access_token)
      expect(output).toEqual(['role1', 'role2'])
    })
  })

  describe('getSystemClientToken', () => {
    it('instantiates the Redis client', async () => {
      tokenStore.getToken.mockResolvedValue(token.access_token)
      await hmppsAuthClient.getSystemClientToken(username)
    })

    describe('when a token already exists in Redis', () => {
      it('returns the token', async () => {
        const output = await hmppsAuthClient.getSystemClientToken(username)
        expect(output).toEqual(token.access_token)
      })
    })

    describe('when a token does not already exist in Redis but there is a username', () => {
      it('fetches a new token from HMPPS Auth with username', async () => {
        tokenStore.getToken.mockResolvedValue(null)

        fakeHmppsAuthApi
          .post(`/oauth/token`, 'grant_type=client_credentials&username=Bob')
          .basicAuth({ user: config.apis.hmppsAuth.systemClientId, pass: config.apis.hmppsAuth.systemClientSecret })
          .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
          .reply(200, token)

        const output = await hmppsAuthClient.getSystemClientToken(username)

        expect(output).toEqual(token.access_token)
        expect(tokenStore.setToken).toBeCalledWith('Bob', token.access_token, 240)
      })
    })

    describe('when a token does not already exist in Redis and there is no username', () => {
      it('fetches a new token from HMPPS Auth without username', async () => {
        tokenStore.getToken.mockResolvedValue(null)

        fakeHmppsAuthApi
          .post(`/oauth/token`, 'grant_type=client_credentials')
          .basicAuth({ user: config.apis.hmppsAuth.systemClientId, pass: config.apis.hmppsAuth.systemClientSecret })
          .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
          .reply(200, token)

        const output = await hmppsAuthClient.getSystemClientToken()

        expect(output).toEqual(token.access_token)
        expect(tokenStore.setToken).toBeCalledWith('%ANONYMOUS%', token.access_token, 240)
      })
    })
  })
})
