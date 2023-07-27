import cookieParser from 'cookie-parser'
import { Router } from 'express'

export default function setUpCookies(): Router {
  const router = Router()
  const cookiePreferencesPostRoute = '/cookie-preferences'

  router.use(cookieParser())

  router.use((req, res, next) => {
    if (req.url !== cookiePreferencesPostRoute) {
      req.session.returnTo = req.originalUrl
    }
    res.locals.acceptAnalyticsCookies = req.cookies?.acceptAnalyticsCookies
    res.locals.analyticsCookiesPreference = req.cookies?.acceptAnalyticsCookies === 'true' ? 'accepted' : 'rejected'
    res.locals.messages = req.flash()
    res.locals.returnTo = req.session.returnTo
    next()
  })

  router.get('/cookie-policy', (req, res) => {
    res.render('pages/cookiePolicy', {
      pageHeading: 'Cookies',
      preference: req.cookies?.acceptAnalyticsCookies,
    })
  })

  router.post(cookiePreferencesPostRoute, (req, res) => {
    if (req.body.acceptAnalyticsCookies) {
      req.flash('cookies', 'saved')
      res.cookie('acceptAnalyticsCookies', req.body.acceptAnalyticsCookies).redirect(302, req.session.returnTo || '/')
    }
  })

  return router
}
