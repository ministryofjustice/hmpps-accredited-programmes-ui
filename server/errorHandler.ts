import type { NextFunction, Request, Response } from 'express'

import logger from '../logger'

// Errors raised in the app (http-errors) carry `status`; errors from API clients
// (@ministryofjustice/hmpps-rest-client) that are not handled carry `responseStatus`
type HandledError = Error & { responseStatus?: number; status?: number }

export default function createErrorHandler(production: boolean) {
  return (error: HandledError, req: Request, res: Response, next: NextFunction): void => {
    logger.error(`Error handling request for '${req.originalUrl}', user '${res.locals.user?.username}'`, error)

    const status = error.status ?? error.responseStatus

    if (status === 401 || status === 403) {
      logger.info('Logging user out')
      return res.redirect('/sign-out')
    }

    res.locals.message = production
      ? 'Something went wrong. The error has been logged. Please try again'
      : error.message
    res.locals.status = status
    res.locals.stack = production ? null : error.stack

    res.status(status || 500)

    const errorTitle = status === 404 ? 'Not Found' : 'Error'

    return res.render('pages/error', {
      pageTitleOverride: errorTitle,
    })
  }
}
