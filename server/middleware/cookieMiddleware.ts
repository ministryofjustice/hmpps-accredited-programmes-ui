import cookieParser from 'cookie-parser'
import { Router } from 'express'

export default function cookieMiddleware(): Router {
  const router = Router()

  router.use(cookieParser())

  router.use((req, res, next) => {
    if (req.url !== '/cookie-preferences') {
      req.session.returnTo = req.originalUrl
    }
    res.locals.acceptAnalyticsCookies = req.cookies?.acceptAnalyticsCookies
    res.locals.analyticsCookiesPreference = req.cookies?.acceptAnalyticsCookies === 'true' ? 'accepted' : 'rejected'
    res.locals.messages = req.flash()
    res.locals.returnTo = req.session.returnTo
    next()
  })

  return router
}
