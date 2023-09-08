import type { Request, Response, TypedRequestHandler } from 'express'
import createError from 'http-errors'

import { referPaths } from '../../paths'
import type { PersonService } from '../../services'
import { PersonUtils, TypeUtils } from '../../utils'

export default class PeopleController {
  constructor(private readonly personService: PersonService) {}

  find(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { courseOfferingId } = req.params
      const { prisonNumber } = req.body

      if (!prisonNumber) {
        req.flash('prisonNumberError', 'Please enter a prison number')
        return res.redirect(referPaths.new({ courseOfferingId }))
      }

      return res.redirect(referPaths.people.show({ courseOfferingId, prisonNumber }))
    }
  }

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { courseOfferingId } = req.params
      const person = await this.personService.getPerson(req.user.token, req.params.prisonNumber)

      if (!person) {
        throw createError(404, {
          userMessage: `Person with prison number ${req.params.prisonNumber} not found.`,
        })
      }

      res.render('referrals/people/show', {
        courseOfferingId,
        pageHeading: `Confirm ${person.name}'s details`,
        personSummaryListRows: PersonUtils.summaryListRows(person),
        prisonNumber: person.prisonNumber,
      })
    }
  }
}
