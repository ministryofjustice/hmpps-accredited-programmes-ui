import type { RequestHandler } from 'express'

import asyncMiddleware from './asyncMiddleware'
import MiddlewareUtils from './middlewareUtils'
import logger from '../../logger'

export default function authorisationMiddleware(authorisedRoles: Array<string> = []): RequestHandler {
  return asyncMiddleware((req, res, next) => {
    const token = res.locals.user?.token
    if (token) {
      const roles = MiddlewareUtils.getUserRolesFromToken(token)

      if (authorisedRoles.length && roles && !roles.some(role => authorisedRoles.includes(role))) {
        logger.error('User is not authorised to access this')
        return res.redirect('/authError')
      }

      return next()
    }

    req.session.returnTo = req.originalUrl
    return res.redirect('/sign-in')
  })
}
