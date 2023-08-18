import crypto from 'crypto'
import type { NextFunction, Request, Response, Router } from 'express'
import express from 'express'
import helmet from 'helmet'

import config from '../config'

export default function setUpWebSecurity(): Router {
  const router = express.Router()

  // Secure code best practice - see:
  // 1. https://expressjs.com/en/advanced/best-practice-security.html,
  // 2. https://www.npmjs.com/package/helmet
  router.use((_req: Request, res: Response, next: NextFunction) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString('hex')
    next()
  })
  router.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          connectSrc: [
            "'self'",
            'https://dc.services.visualstudio.com/v2/track',
            'https://northeurope-0.in.applicationinsights.azure.com//v2/track',
          ],
          defaultSrc: ["'self'"],
          fontSrc: ["'self'"],
          formAction: [`'self' ${config.apis.hmppsAuth.externalUrl}`],
          // This nonce allows us to use scripts with the use of the `cspNonce` local, e.g (in a Nunjucks template):
          // <script nonce="{{ cspNonce }}">
          // or
          // <link href="http://example.com/" rel="stylesheet" nonce="{{ cspNonce }}">
          // This ensures only scripts we trust are loaded, and not anything injected into the
          // page by an attacker.
          scriptSrc: ["'self'", (_req, res) => `'nonce-${(res as Response).locals.cspNonce}'`, 'js.monitor.azure.com'],
          styleSrc: ["'self'", (_req, res) => `'nonce-${(res as Response).locals.cspNonce}'`],
        },
      },
      crossOriginEmbedderPolicy: true,
    }),
  )
  return router
}
