import nock from 'nock'

import config from '../config'
import HmppsAuthClient from './hmppsAuthClient'
import { createRedisClient } from './redisClient'
import TokenStore from './tokenStore'

jest.mock('./tokenStore')
jest.mock('./redisClient')

const tokenStore = new TokenStore(createRedisClient()) as jest.Mocked<TokenStore>

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
          .post('/oauth/token', 'grant_type=client_credentials&username=Bob')
          .basicAuth({ pass: config.apis.hmppsAuth.systemClientSecret, user: config.apis.hmppsAuth.systemClientId })
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
          .post('/oauth/token', 'grant_type=client_credentials')
          .basicAuth({ pass: config.apis.hmppsAuth.systemClientSecret, user: config.apis.hmppsAuth.systemClientId })
          .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
          .reply(200, token)

        const output = await hmppsAuthClient.getSystemClientToken()

        expect(output).toEqual(token.access_token)
        expect(tokenStore.setToken).toBeCalledWith('%ANONYMOUS%', token.access_token, 240)
      })
    })
  })
})
