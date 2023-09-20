import type { RequestHandler } from 'express'

import asyncMiddleware from './asyncMiddleware'
import logger from '../../logger'
import type Role from '../authentication/role'
import UserUtils from '../utils/userUtils'

export default function authorisationMiddleware(authorisedRoles: Array<Role | string> = []): RequestHandler {
  return asyncMiddleware((req, res, next) => {
    const token = res.locals.user?.token
    if (token) {
      const roles = UserUtils.getUserRolesFromToken(token)

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
