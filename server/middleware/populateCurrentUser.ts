import type { RequestHandler } from 'express'

import { ApplicationRoles } from './roleBasedAccessMiddleware'
import logger from '../../logger'
import type { UserService } from '../services'
import { UserUtils } from '../utils'

export default function populateCurrentUser(userService: UserService): RequestHandler {
  return async (req, res, next) => {
    try {
      if (res.locals.user) {
        const { token } = res.locals.user
        req.session.user ||= await userService.getCurrentUserWithDetails(token)

        if (req.session.user) {
          const roles = UserUtils.getUserRolesFromToken(token)
          res.locals.user = {
            ...res.locals.user,
            ...req.session.user,
            hasReferrerRole: roles?.includes(ApplicationRoles.ACP_REFERRER),
            roles,
          }
        } else {
          logger.info('No user available')
        }
      }
      next()
    } catch (error) {
      logger.error(error, `Failed to retrieve user for: ${res.locals.user && res.locals.user.username}`)
      next(error)
    }
  }
}
