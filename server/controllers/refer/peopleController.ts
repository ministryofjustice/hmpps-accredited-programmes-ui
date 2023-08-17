import type { Request, Response, TypedRequestHandler } from 'express'
import createError from 'http-errors'

import { referPaths } from '../../paths'
import type { PersonService } from '../../services'
import { personUtils, typeUtils } from '../../utils'

export default class PeopleController {
  constructor(private readonly personService: PersonService) {}

  find(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      typeUtils.assertHasUser(req)

      const { courseId, courseOfferingId } = req.params
      const { prisonNumber } = req.body

      res.redirect(referPaths.people.show({ courseId, courseOfferingId, prisonNumber }))
    }
  }

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      typeUtils.assertHasUser(req)

      const { courseId, courseOfferingId } = req.params
      const person = await this.personService.getPerson(req.user.token, req.params.prisonNumber)

      if (!person) {
        throw createError(404, {
          userMessage: `Person with prison number ${req.params.prisonNumber} not found.`,
        })
      }

      res.render('referrals/people/show', {
        courseId,
        courseOfferingId,
        pageHeading: `Confirm ${person.name}'s details`,
        personSummaryListRows: personUtils.summaryListRows(person),
      })
    }
  }
}
