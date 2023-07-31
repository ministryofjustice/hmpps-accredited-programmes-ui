import cookieParser from 'cookie-parser'
import { Router } from 'express'

export default function setUpCookies(): Router {
  const router = Router()

  router.use(cookieParser())

  router.use((req, res, next) => {
    res.locals.acceptAnalyticsCookies = req.cookies?.acceptAnalyticsCookies
    next()
  })

  router.post('/cookie-preferences', (req, res) => {
    if (req.body.acceptAnalyticsCookies) {
      // TODO: get this to redirect to current page
      res.cookie('acceptAnalyticsCookies', req.body.acceptAnalyticsCookies).redirect(302, '/')
    }
  })

  return router
}
