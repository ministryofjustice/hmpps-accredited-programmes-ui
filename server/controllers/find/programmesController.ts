import type { Request, Response, TypedRequestHandler } from 'express'
import ProgrammeService from '../../services/programmeService'

export default class ProgrammesController {
  constructor(private readonly programmeService: ProgrammeService) {}

  index(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const programmes = await this.programmeService.getProgrammes()

      res.render('programmes/index', { programmes })
    }
  }
}
