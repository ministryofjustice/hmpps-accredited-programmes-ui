import type { NextFunction, Request, RequestHandler, Response } from 'express'

import logger from '../../logger'
import config from '../config'

export default function pniAccessMiddleware(requestHandler: RequestHandler) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (config.flags.pniEnabledOrganisations.includes(res.locals.user.activeCaseLoadId)) {
      return requestHandler(req, res, next)
    }

    logger.error('Users organisation is not authorised to access PNI')
    return res.redirect('/authError')
  }
}
