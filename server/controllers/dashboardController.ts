import type { Request, RequestHandler, Response } from 'express'

import { assessPaths, findPaths, referPaths } from '../paths'

export default class DashboardController {
  index(): RequestHandler {
    return (_req: Request, res: Response) => {
      res.render('dashboard/index', {
        assessCaseListPath: assessPaths.caseList.index({}),
        findPath: findPaths.index({}),
        pageHeading: 'Accredited Programmes: find and refer',
        referCaseListPath: referPaths.caseList.index({}),
      })
    }
  }
}
