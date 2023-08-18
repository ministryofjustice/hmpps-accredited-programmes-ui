import type { RequestHandler } from 'express'
import passport from 'passport'
import { Strategy } from 'passport-oauth2'

import ClientCredentials from './clientCredentials'
import config from '../config'
import type { TokenVerifier } from '../data'

passport.serializeUser((user, done) => {
  // Not used but required for Passport
  done(null, user)
})

passport.deserializeUser((user, done) => {
  // Not used but required for Passport
  done(null, user as Express.User)
})

type AuthenticationMiddleware = (tokenVerifier: TokenVerifier) => RequestHandler

export type { AuthenticationMiddleware }

export default class Auth {
  static authenticationMiddleware: AuthenticationMiddleware = verifyToken => {
    return async (req, res, next) => {
      if (req.isAuthenticated() && (await verifyToken(req))) {
        return next()
      }
      req.session.returnTo = req.originalUrl
      return res.redirect('/sign-in')
    }
  }

  static init(): void {
    const strategy = new Strategy(
      {
        authorizationURL: `${config.apis.hmppsAuth.externalUrl}/oauth/authorize`,
        callbackURL: `${config.domain}/sign-in/callback`,
        clientID: config.apis.hmppsAuth.apiClientId,
        clientSecret: config.apis.hmppsAuth.apiClientSecret,
        customHeaders: { Authorization: ClientCredentials.generateOauthClientToken() },
        state: true,
        tokenURL: `${config.apis.hmppsAuth.url}/oauth/token`,
      },
      (token, refreshToken, params, profile, done) => {
        return done(null, { authSource: params.auth_source, token, username: params.user_name })
      },
    )

    passport.use(strategy)
  }
}
