import type { Request, Response, TypedRequestHandler } from 'express'

import ProgrammeService from '../../services/programmeService'
import { programmeListItems } from '../../utils/programmeUtils'

export default class ProgrammesController {
  constructor(private readonly programmeService: ProgrammeService) {}

  index(): TypedRequestHandler<Request, Response> {
    return async (_req: Request, res: Response) => {
      const programmes = await this.programmeService.getProgrammes('token')

      res.render('programmes/index', {
        pageHeading: 'List of accredited programmes',
        programmeListItems: programmeListItems(programmes),
      })
    }
  }
}
