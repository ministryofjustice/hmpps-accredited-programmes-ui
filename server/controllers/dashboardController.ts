import type { Request, RequestHandler, Response } from 'express'

import { assessPaths, findPaths, referPaths, reportsPaths } from '../paths'

export default class DashboardController {
  accessibilityStatement(): RequestHandler {
    return (_req: Request, res: Response) => {
      res.render('accessibilityStatement/index', {
        pageHeading: 'Accessibility statement',
      })
    }
  }

  index(): RequestHandler {
    return (_req: Request, res: Response) => {
      res.render('dashboard/index', {
        assessCaseListPath: assessPaths.caseList.index({}),
        findPath: findPaths.pniFind.personSearch({}),
        pageHeading: 'Accredited Programmes: find and refer',
        referCaseListPath: referPaths.caseList.index({}),
        reportPath: reportsPaths.show({}),
      })
    }
  }
}
