import type { Request, Response, TypedRequestHandler } from 'express'
import createError from 'http-errors'
import type { ResponseError } from 'superagent'

import { referPaths } from '../../paths'
import type { PersonService } from '../../services'
import { PersonUtils, TypeUtils } from '../../utils'
import type { Person } from '@accredited-programmes/models'

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

      let person: Person

      try {
        person = await this.personService.getPerson(
          req.user.username,
          req.params.prisonNumber,
          res.locals.user.caseloads,
        )
      } catch (error) {
        const knownError = error as ResponseError

        if (knownError.status === 404) {
          req.flash('prisonNumberError', `No person with a prison number '${req.params.prisonNumber}' was found`)
          return res.redirect(referPaths.new({ courseOfferingId }))
        }

        throw createError(knownError)
      }

      return res.render('referrals/people/show', {
        courseOfferingId,
        pageHeading: `Confirm ${person.name}'s details`,
        personSummaryListRows: PersonUtils.summaryListRows(person),
        prisonNumber: person.prisonNumber,
      })
    }
  }
}
