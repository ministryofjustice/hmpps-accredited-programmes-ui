import { RedisStore } from 'connect-redis'
import { randomUUID } from 'crypto'
import type { Router } from 'express'
import express from 'express'
import session from 'express-session'

import logger from '../../logger'
import config from '../config'
import { createRedisClient } from '../data'

export default function setUpWebSession(): Router {
  const client = createRedisClient()
  client.connect().catch((err: Error) => logger.error('Error connecting to Redis', err))

  const router = express.Router()
  router.use(
    session({
      cookie: { maxAge: config.session.expiryMinutes * 60 * 1000, sameSite: 'lax', secure: config.https },
      resave: false, // redis implements touch so shouldn't need this
      rolling: true,
      saveUninitialized: false,
      secret: config.session.secret,
      store: new RedisStore({ client }),
    }),
  )

  router.use((req, res, next) => {
    const headerName = 'X-Request-Id'
    const oldValue = req.get(headerName)
    const id = oldValue === undefined ? randomUUID() : oldValue

    res.set(headerName, id)
    req.id = id

    next()
  })

  return router
}
