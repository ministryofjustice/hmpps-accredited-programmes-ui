import dpsComponents from '@ministryofjustice/hmpps-connect-dps-components'
import flash from 'connect-flash'
import type { Router } from 'express'
import express from 'express'
import passport from 'passport'

import { Auth } from '../authentication'
import config from '../config'

const router = express.Router()

export default function setUpAuth(): Router {
  Auth.init()

  router.use(passport.initialize())
  router.use(passport.session())
  router.use(flash())

  router.get('/autherror', dpsComponents.getPageComponents({ dpsUrl: config.dpsUrl }), (req, res) => {
    res.status(401)
    return res.render('autherror')
  })

  router.get('/sign-in', passport.authenticate('oauth2'))

  router.get('/sign-in/callback', (req, res, next) =>
    passport.authenticate('oauth2', {
      failureRedirect: '/autherror',
      successReturnToOrRedirect: req.session.returnTo || '/',
    })(req, res, next),
  )

  const authUrl = config.apis.hmppsAuth.externalUrl
  const authSignOutUrl = `${authUrl}/sign-out?client_id=${config.apis.hmppsAuth.apiClientId}&redirect_uri=${config.domain}`

  router.use('/sign-out', (req, res, next) => {
    if (req.user) {
      req.logout(err => {
        if (err) return next(err)
        return req.session.destroy(() => res.redirect(authSignOutUrl))
      })
    } else res.redirect(authSignOutUrl)
  })

  router.use('/account-details', (req, res) => {
    res.redirect(`${authUrl}/account-details`)
  })

  router.use((req, res, next) => {
    res.locals.user = req.user
    next()
  })

  return router
}
