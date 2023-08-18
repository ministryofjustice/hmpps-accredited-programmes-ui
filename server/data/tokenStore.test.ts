import type { RedisClient } from './redisClient'
import TokenStore from './tokenStore'

const redisClient = {
  connect: jest.fn(),
  get: jest.fn(),
  isOpen: true,
  on: jest.fn(),
  set: jest.fn(),
} as unknown as jest.Mocked<RedisClient>

describe('tokenStore', () => {
  let tokenStore: TokenStore

  beforeEach(() => {
    tokenStore = new TokenStore(redisClient as unknown as RedisClient)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getToken', () => {
    it('calls Redis and retrieves token', async () => {
      ;(redisClient.get as jest.Mock).mockResolvedValue('token-1')

      await expect(tokenStore.getToken('user-1')).resolves.toBe('token-1')

      expect(redisClient.get).toHaveBeenCalledWith('systemToken:user-1')
    })

    describe('when there is no Redis connection', () => {
      it('connects to Redis', async () => {
        ;(redisClient as unknown as Record<string, boolean>).isOpen = false

        await tokenStore.getToken('user-1')

        expect(redisClient.connect).toHaveBeenCalledWith()
      })
    })
  })

  describe('setToken', () => {
    it('asks Redis to set the token', async () => {
      await tokenStore.setToken('user-1', 'token-1', 10)

      expect(redisClient.set).toHaveBeenCalledWith('systemToken:user-1', 'token-1', { EX: 10 })
    })

    describe('when there is no Redis connection', () => {
      it('connects to Redis', async () => {
        ;(redisClient as unknown as Record<string, boolean>).isOpen = false

        await tokenStore.setToken('user-1', 'token-1', 10)

        expect(redisClient.connect).toHaveBeenCalledWith()
      })
    })
  })
})
