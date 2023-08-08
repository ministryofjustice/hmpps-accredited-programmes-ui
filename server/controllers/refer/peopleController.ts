import type { Request, Response, TypedRequestHandler } from 'express'
import createError from 'http-errors'

import type { PersonService } from '../../services'
import { personUtils, typeUtils } from '../../utils'

export default class PeopleController {
  constructor(private readonly personService: PersonService) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      typeUtils.assertHasUser(req)

      const person = await this.personService.getPerson(req.user.token, req.params.prisonNumber)

      if (!person) {
        throw createError(404, {
          userMessage: `Person with prison number ${req.params.prisonNumber} not found.`,
        })
      }

      res.render('referrals/confirmPerson', {
        pageHeading: `Confirm ${person.name}'s details`,
        personSummaryListRows: personUtils.summaryListRows(person),
      })
    }
  }
}
