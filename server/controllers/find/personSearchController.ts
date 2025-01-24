import type { Request, Response, TypedRequestHandler } from 'express'

import { ApplicationRoles } from '../../middleware'
import { findPaths } from '../../paths'
import type { SanitisedError } from '../../sanitisedError'
import type { PersonService } from '../../services'
import { FormUtils } from '../../utils'

export default class PersonSearchController {
  constructor(private readonly personService: PersonService) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      FormUtils.setFieldErrors(req, res, ['prisonNumber'])

      res.render('find/personSearch', {
        pageHeading: 'Find recommended programmes',
      })
    }
  }

  submit(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const { prisonNumber } = req.body

      const canViewAllPrisoners = [ApplicationRoles.ACP_PROGRAMME_TEAM, ApplicationRoles.ACP_REFERRER].every(role =>
        res.locals.user.roles.includes(role),
      )

      if (!prisonNumber) {
        req.flash('prisonNumberError', 'Enter a prison number')
        return res.redirect(findPaths.pniFind.personSearch.pattern)
      }

      try {
        const person = await this.personService.getPerson(
          res.locals.user.username,
          prisonNumber,
          canViewAllPrisoners ? [] : res.locals.user.caseloads,
        )

        req.session.pniFindAndReferData = {
          prisonNumber: person.prisonNumber,
        }
      } catch (error) {
        const sanitisedError = error as SanitisedError

        if (sanitisedError.status === 404) {
          req.flash('prisonNumberError', `No person with prison number '${prisonNumber}' found`)
          return res.redirect(findPaths.pniFind.personSearch.pattern)
        }

        throw error
      }

      return res.redirect(findPaths.pniFind.recommendedPathway.pattern)
    }
  }
}
