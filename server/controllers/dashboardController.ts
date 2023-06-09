import type { Request, RequestHandler, Response } from 'express'

import findPaths from '../paths/find'

export default class DashboardController {
  index(): RequestHandler {
    return (_req: Request, res: Response) => {
      res.render('dashboard/index', {
        pageHeading: 'Accredited Programmes',
        findPath: findPaths.courses.index({}),
      })
    }
  }
}
