import type { createClient } from 'redis'

type RedisClient = ReturnType<typeof createClient>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const aMockedOutRedisClient: Record<string, any> = {
  connect: jest.fn(() => Promise.resolve()),
  del: jest.fn(() => Promise.resolve(1)),
  get: jest.fn(() => Promise.resolve(null)),
  isOpen: true,
  on: jest.fn((event: string, callback: (error: Error) => void) => {
    if (event === 'error') {
      callback(new Error('Mocked Redis error'))
    }
  }),
  set: jest.fn(() => Promise.resolve()),
}

const createRedisClient = () => {
  return aMockedOutRedisClient
}

export { aMockedOutRedisClient, createRedisClient }

export type { RedisClient }
