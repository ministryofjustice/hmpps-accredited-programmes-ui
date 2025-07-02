import type { createClient } from 'redis'

const aMockedOutRedisClient = {
  connect: jest.fn(),
  del: jest.fn(),
  get: jest.fn(),
  isOpen: true,
  on: jest.fn(),
  set: jest.fn(),
}

const createRedisClient = () => {
  return aMockedOutRedisClient
}

type RedisClient = ReturnType<typeof createClient>

export { createRedisClient }

export type { RedisClient }
