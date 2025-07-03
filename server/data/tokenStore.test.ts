import { aMockedOutRedisClient } from '../../__mocks__/server/data/redisClient'
import TokenStore from './tokenStore'

describe('tokenStore', () => {
  const redisClient = aMockedOutRedisClient
  let tokenStore: TokenStore

  beforeEach(() => {
    tokenStore = new TokenStore(aMockedOutRedisClient as unknown as any)
  })

  afterEach(() => {
    aMockedOutRedisClient.isOpen = true // Reset the connection state after each test
  })

  describe('getToken', () => {
    it('calls Redis and retrieves token', async () => {
      jest.spyOn(aMockedOutRedisClient, 'get').mockResolvedValueOnce('token-1')

      await expect(tokenStore.getToken('user-1')).resolves.toBe('token-1')

      expect(aMockedOutRedisClient.get).toHaveBeenCalledWith('systemToken:user-1')
    })

    describe('when there is no Redis connection', () => {
      it('connects to Redis', async () => {
        // Given
       aMockedOutRedisClient.isOpen = false 

        // When
        await tokenStore.getToken('user-1')

        // Then
        expect(aMockedOutRedisClient.connect).toHaveBeenCalledWith()
      })
    })
  })

  describe('setToken', () => {
    it('asks Redis to set the token', async () => {
      await tokenStore.setToken('user-1', 'token-1', 10)

      expect(aMockedOutRedisClient.set).toHaveBeenCalledWith('systemToken:user-1', 'token-1', { EX: 10 })
    })

    describe('when there is no Redis connection', () => {
      it('connects to Redis', async () => {
        // Given
        aMockedOutRedisClient.isOpen = false

        // When
        await tokenStore.setToken('user-1', 'token-1', 10)

        // Then
        expect(aMockedOutRedisClient.connect).toHaveBeenCalledWith()
      })
    })
  })
})
