import type { Router } from 'express'
import express from 'express'

import { healthCheck } from '../services'

export default function setUpHealthChecks(): Router {
  const router = express.Router()

  router.get('/health', (req, res, next) => {
    healthCheck(result => {
      if (!result.healthy) {
        res.status(503)
      }
      res.json(result)
    })
  })

  router.get('/ping', (req, res) =>
    res.send({
      status: 'UP',
    }),
  )

  return router
}
