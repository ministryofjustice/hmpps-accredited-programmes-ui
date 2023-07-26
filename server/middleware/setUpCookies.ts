import { Router } from 'express'

export default function setUpCookies(): Router {
  const router = Router()

  router.post('/cookie-preferences', (req, res) => {
    if (req.body.acceptAnalyticsCookies) {
      // TODO: get this to redirect to current page
      res.cookie('acceptAnalyticsCookies', req.body.acceptAnalyticsCookies).redirect(302, '/')
    }
  })

  return router
}
