import { Router } from 'express'

import populateCurrentUser from './populateCurrentUser'
import { auth } from '../authentication'
import { verifyToken } from '../data'

export default function setUpCurrentUser(): Router {
  const router = Router({ mergeParams: true })
  router.use(auth.authenticationMiddleware(verifyToken))
  router.use(populateCurrentUser())
  return router
}
