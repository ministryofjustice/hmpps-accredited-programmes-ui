import type { Request, RequestHandler, Response } from 'express'

import { findPaths } from '../paths'

export default class DashboardController {
  index(): RequestHandler {
    return (_req: Request, res: Response) => {
      console.log(res.locals.user.roles)
      res.render('dashboard/index', {
        findPath: findPaths.index({}),
        pageHeading: 'Accredited Programmes',
      })
    }
  }
}
