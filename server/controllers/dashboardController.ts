import { Request, RequestHandler, Response } from 'express'

export default class DashboardController {
  index(): RequestHandler {
    return (_req: Request, res: Response) => {
      res.render('dashboard/index', {
        pageHeading: 'Accredited Programmes',
      })
    }
  }
}
