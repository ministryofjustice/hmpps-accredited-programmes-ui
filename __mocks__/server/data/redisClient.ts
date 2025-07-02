import { createClient } from "redis"

const aMockedOutRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  connect: jest.fn(),
  isOpen: true,
  on: jest.fn(),
}

const createRedisClient = () => {
  return aMockedOutRedisClient
}

export { createRedisClient }

type RedisClient = ReturnType<typeof createClient>

export type { RedisClient }