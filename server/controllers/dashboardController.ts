import type { Request, RequestHandler, Response } from 'express'

import { findPaths } from '../paths'

export default class DashboardController {
  index(): RequestHandler {
    return (_req: Request, res: Response) => {
      res.render('dashboard/index', {
        findPath: findPaths.index({}),
        pageHeading: 'Accredited Programmes',
      })
    }
  }
}
