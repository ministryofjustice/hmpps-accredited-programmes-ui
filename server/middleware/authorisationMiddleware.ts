import type { RequestHandler } from 'express'

import asyncMiddleware from './asyncMiddleware'
import logger from '../../logger'
import UserUtils from '../utils/userUtils'

export default function authorisationMiddleware(authorisedRoles: Array<string> = []): RequestHandler {
  return asyncMiddleware((req, res, next) => {
    const userToken = res.locals.user?.token
    if (userToken) {
      const roles = UserUtils.getUserRolesFromToken(userToken)

      if (authorisedRoles.length && !roles?.some(role => authorisedRoles.includes(role))) {
        logger.error('User is not authorised to access this')
        return res.redirect('/authError')
      }

      return next()
    }

    req.session.returnTo = req.originalUrl
    return res.redirect('/sign-in')
  })
}
