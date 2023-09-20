import type { RequestHandler } from 'express'

import logger from '../../logger'

export default function redirectIfDisabledMiddleware(isEnabled: boolean): RequestHandler {
  return (req, res, next) => {
    if (isEnabled) {
      return next()
    }
    logger.warn('Feature not currently enabled')
    return res.redirect('/')
  }
}
