import type { RequestHandler } from 'express'

import { ApplicationRoles } from './roleBasedAccessControl'
import logger from '../../logger'
import type { UserService } from '../services'
import { UserUtils } from '../utils'

export default function populateCurrentUser(userService: UserService): RequestHandler {
  return async (req, res, next) => {
    try {
      if (res.locals.user) {
        const { token } = res.locals.user
        const user = res.locals.user && (await userService.getUser(token))
        if (user) {
          const roles = UserUtils.getUserRolesFromToken(token)
          res.locals.user = {
            ...user,
            ...res.locals.user,
            hasReferrerAuthority: roles?.includes(ApplicationRoles.ACP_REFERRER),
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
