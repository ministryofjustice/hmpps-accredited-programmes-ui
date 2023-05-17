import { Router } from 'express'

import populateCurrentUser from './populateCurrentUser'
import auth from '../authentication/auth'
import tokenVerifier from '../data/tokenVerification'
import type { Services } from '../services'

export default function setUpCurrentUser({ userService }: Services): Router {
  const router = Router({ mergeParams: true })
  router.use(auth.authenticationMiddleware(tokenVerifier))
  router.use(populateCurrentUser(userService))
  return router
}
