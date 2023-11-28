import RedisStore from 'connect-redis'
import type { Router } from 'express'
import express from 'express'
import session from 'express-session'
import { v4 as uuidv4 } from 'uuid'

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

  // Update a value in the cookie so that the set-cookie will be sent.
  // Only changes every minute so that it's not sent with every request.
  router.use((req, res, next) => {
    req.session.nowInMinutes = Math.floor(Date.now() / 60e3)
    next()
  })

  router.use((req, res, next) => {
    const headerName = 'X-Request-Id'
    const oldValue = req.get(headerName)
    const id = oldValue === undefined ? uuidv4() : oldValue

    res.set(headerName, id)
    req.id = id

    next()
  })

  return router
}
