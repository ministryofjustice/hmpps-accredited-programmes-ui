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

  // This nonce allows us to use scripts with the use of the `cspNonce` local, e.g (in a Nunjucks template):
  // <script nonce="{{ cspNonce }}">
  // or
  // <link href="http://example.com/" rel="stylesheet" nonce="{{ cspNonce }}">
  // This ensures only scripts we trust are loaded, and not anything injected into the
  // page by an attacker.
  const scriptSrc = [
    "'self'",
    (_req: Request, res: Response) => `'nonce-${res.locals.cspNonce}'`,
    'js.monitor.azure.com',
  ] as Array<string>
  const styleSrc = ["'self'", (_req: Request, res: Response) => `'nonce-${res.locals.cspNonce}'`] as Array<string>
  const imgSrc = ["'self'", 'data:']
  const fontSrc = ["'self'"]
  const formAction = [`'self' ${config.apis.hmppsAuth.externalUrl} ${config.dpsUrl}`]

  if (config.apis.hmppsComponents.url) {
    scriptSrc.push(config.apis.hmppsComponents.url)
    styleSrc.push(config.apis.hmppsComponents.url)
    imgSrc.push(config.apis.hmppsComponents.url)
    fontSrc.push(config.apis.hmppsComponents.url)
  }

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
          fontSrc,
          formAction,
          imgSrc,
          // This nonce allows us to use scripts with the use of the `cspNonce` local, e.g (in a Nunjucks template):
          // <script nonce="{{ cspNonce }}">
          // or
          // <link href="http://example.com/" rel="stylesheet" nonce="{{ cspNonce }}">
          // This ensures only scripts we trust are loaded, and not anything injected into the
          // page by an attacker.
          scriptSrc,
          styleSrc,
        },
      },
      crossOriginEmbedderPolicy: true,
    }),
  )
  return router
}
