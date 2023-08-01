import type { Request, RequestHandler, Response } from 'express'

export default class CookiePolicyController {
  index(): RequestHandler {
    return (req: Request, res: Response) => {
      res.render('cookiePolicy/index', {
        pageHeading: 'Cookies',
        preference: req.cookies?.acceptAnalyticsCookies,
      })
    }
  }

  update(): RequestHandler {
    return (req: Request, res: Response) => {
      if (req.body.acceptAnalyticsCookies) {
        req.flash('cookies', 'saved')
        res.cookie('acceptAnalyticsCookies', req.body.acceptAnalyticsCookies).redirect(302, req.session.returnTo || '/')
      }
    }
  }
}
