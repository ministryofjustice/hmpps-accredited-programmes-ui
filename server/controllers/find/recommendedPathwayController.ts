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

      req.session.pniFindAndReferData = {
        prisonNumber,
        programmePathway: pni?.programmePathway || 'UNKNOWN',
      }

      const ogrs3WarningBox = {
        dismissible: false,
        html: '<p>The recommended pathway shown here is based on the old risk predictors (OGRS3). If this person’s risk scores use the new predictors (OGRS4), referrers or programme teams should calculate the recommended pathway manually.</p><p>Following the instructions in the Needs and Suitability guide, use the PNI scores under ‘How is this calculated?’ and the risk scores in this service or OASys to calculate this.</p>',
        showTitleAsHeading: true,
        title: 'The pathway shown here is currently based on OGRS3 risk scores',
        variant: 'warning',
      }

      return res.render('find/recommendedPathway', {
        hrefs: {
          back: findPaths.pniFind.personSearch.pattern,
          programmes: findPaths.pniFind.recommendedProgrammes.pattern,
        },
        notEligible: pni?.programmePathway === notEligiblePathway,
        ogrs3WarningBox,
        pageHeading: `Recommended programme pathway for ${person.name}`,
        pathwayContent: PniUtils.pathwayContent(person.name, pni?.programmePathway),
        ...templateLocals,
      })
    }
  }
}
