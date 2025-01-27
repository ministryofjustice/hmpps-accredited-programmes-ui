import type { Request, Response, TypedRequestHandler } from 'express'

import { findPaths } from '../../paths'
import type { PersonService, PniService } from '../../services'
import { PniUtils } from '../../utils'

const missingInformationPathway = 'MISSING_INFORMATION'
const notEligiblePathway = 'ALTERNATIVE_PATHWAY'

export default class RecommendedPathwayController {
  constructor(
    private readonly personService: PersonService,
    private readonly pniService: PniService,
  ) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      let pniError = false
      const prisonNumber = req.session.pniFindAndReferData?.prisonNumber

      if (!prisonNumber) {
        return res.redirect(findPaths.pniFind.personSearch.pattern)
      }

      const person = await this.personService.getPerson(res.locals.user.username, prisonNumber)
      const pni = await this.pniService
        .getPni(res.locals.user.username, prisonNumber, { gender: person.gender })
        .catch(() => {
          pniError = true
        })

      let templateLocals: Record<string, unknown> = {
        hasData: false,
      }

      if (pni) {
        const {
          NeedsScore: {
            DomainScore: { RelationshipDomainScore, SelfManagementDomainScore, SexDomainScore, ThinkingDomainScore },
          },
        } = pni

        templateLocals = {
          hasData: true,
          missingInformation: pni.programmePathway === missingInformationPathway,
          relationshipsSummaryListRows: PniUtils.relationshipsSummaryListRows(RelationshipDomainScore),
          selfManagementSummaryListRows: PniUtils.selfManagementSummaryListRows(SelfManagementDomainScore),
          sexSummaryListRows: PniUtils.sexSummaryListRows(SexDomainScore),
          thinkingSummaryListRows: PniUtils.thinkingSummaryListRows(ThinkingDomainScore),
        }
      } else if (!pniError) {
        templateLocals = {
          hasData: false,
          pathwayContent: PniUtils.pathwayContent(person.name, missingInformationPathway),
        }
      }

      return res.render('find/recommendedPathway', {
        hrefs: {
          back: findPaths.pniFind.personSearch.pattern,
          programmes: findPaths.pniFind.recommenedProgrammes.pattern,
        },
        notEligible: pni?.programmePathway === notEligiblePathway,
        pageHeading: `Recommended programme pathway for ${person.name}`,
        pathwayContent: PniUtils.pathwayContent(person.name, pni?.programmePathway),
        ...templateLocals,
      })
    }
  }
}
