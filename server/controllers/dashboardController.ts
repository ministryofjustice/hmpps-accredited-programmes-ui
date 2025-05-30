import type { Request, RequestHandler, Response } from 'express'

import config from '../config'
import { ApplicationRoles } from '../middleware'
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
        findAllProgrammesPath: findPaths.index({}),
        findPath: findPaths.pniFind.personSearch({}),
        hspPath: assessPaths.hspReferrals.show({}),
        pageHeading: 'Accredited Programmes: find and refer',
        referCaseListPath: referPaths.caseList.index({}),
        reportPath: reportsPaths.show({}),
        showHspLink: config.flags.hspEnabled && res.locals.user.roles.includes(ApplicationRoles.ACP_HSP),
      })
    }
  }
}
