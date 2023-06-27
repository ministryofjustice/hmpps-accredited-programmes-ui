import { Router } from 'express'

import populateCurrentUser from './populateCurrentUser'
import auth from '../authentication/auth'
import { verifyToken } from '../data'
import type { Services } from '../services'

export default function setUpCurrentUser({ userService }: Services): Router {
  const router = Router({ mergeParams: true })
  router.use(auth.authenticationMiddleware(verifyToken))
  router.use(populateCurrentUser(userService))
  return router
}
