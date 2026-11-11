/* istanbul ignore file */

import type { RedisClientType } from 'redis'
import { createClient } from 'redis'

import logger from '../../logger'
import config from '../config'

type RedisClient = RedisClientType

const url =
  config.redis.tls_enabled === 'true'
    ? `rediss://${config.redis.host}:${config.redis.port}`
    : `redis://${config.redis.host}:${config.redis.port}`

const createRedisClient = (): RedisClient => {
  const shouldUseTls = config.redis.tls_enabled === 'true'

  const client = createClient({
    password: config.redis.password,
    socket: {
      host: config.redis.host,
      port: config.redis.port,
      reconnectStrategy: (attempts: number) => {
        // Exponential back off: 20ms, 40ms, 80ms..., capped to retry every 30 seconds
        const nextDelay = Math.min(2 ** attempts * 20, 30000)
        logger.info(`Retry Redis connection attempt: ${attempts}, next attempt in: ${nextDelay}ms`)
        return nextDelay
      },
      tls: shouldUseTls ? true : undefined,
    },
    url,
  })

  client.on('error', (e: Error) => logger.error('Redis client error', e))

  return client
}

export { createRedisClient }

export type { RedisClient }
