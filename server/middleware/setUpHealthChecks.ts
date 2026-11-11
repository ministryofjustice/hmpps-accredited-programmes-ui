import { endpointHealthComponent, monitoringMiddleware } from '@ministryofjustice/hmpps-monitoring'
import type { Router } from 'express'
import express from 'express'

import logger from '../../logger'
import applicationInfo from '../applicationInfo'
import config from '../config'

export default function setUpHealthChecks(): Router {
  const router = express.Router()

  const middleware = monitoringMiddleware({
    applicationInfo: applicationInfo(),
    healthComponents: [
      endpointHealthComponent(logger, 'hmppsAuth', config.apis.hmppsAuth),
      endpointHealthComponent(logger, 'tokenVerification', config.apis.tokenVerification),
    ],
  })

  router.get('/health', middleware.health)
  router.get('/info', middleware.info)
  router.get('/ping', middleware.ping)

  return router
}
