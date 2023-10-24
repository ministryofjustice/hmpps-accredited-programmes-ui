import type { Request, Response, TypedRequestHandler } from 'express'

import type { CourseService, OrganisationService, PersonService, ReferralService } from '../../services'
import { CourseUtils, DateUtils, PersonUtils, ReferralUtils, TypeUtils } from '../../utils'
import type { Person, Referral } from '@accredited-programmes/models'
import type { GovukFrontendSummaryListRowWithValue, MojFrontendSideNavigationItem } from '@accredited-programmes/ui'

export default class SubmittedReferralsController {
  constructor(
    private readonly courseService: CourseService,
    private readonly organisationService: OrganisationService,
    private readonly personService: PersonService,
    private readonly referralService: ReferralService,
  ) {}

  personalDetails(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const sharedPageData = await this.sharedPageData(req, res)

      res.render('referrals/submitted/personalDetails', {
        ...sharedPageData,
        importedFromText: `Imported from Nomis on ${DateUtils.govukFormattedFullDateString()}.`,
        personSummaryListRows: PersonUtils.summaryListRows(sharedPageData.person),
      })
    }
  }

  private async sharedPageData(
    req: Request,
    res: Response,
  ): Promise<{
    courseOfferingSummaryListRows: Array<GovukFrontendSummaryListRowWithValue>
    navigationItems: Array<MojFrontendSideNavigationItem>
    pageHeading: string
    person: Person
    referral: Referral
  }> {
    TypeUtils.assertHasUser(req)

    const { referralId } = req.params
    const { token, username } = req.user

    const referral = await this.referralService.getReferral(token, referralId)
    const [course, courseOffering, person] = await Promise.all([
      this.courseService.getCourseByOffering(token, referral.offeringId),
      this.courseService.getOffering(token, referral.offeringId),
      this.personService.getPerson(username, referral.prisonNumber, res.locals.user.caseloads),
    ])

    const organisation = await this.organisationService.getOrganisation(token, courseOffering.organisationId)

    const coursePresenter = CourseUtils.presentCourse(course)

    return {
      courseOfferingSummaryListRows: ReferralUtils.courseOfferingSummaryListRows(coursePresenter, organisation.name),
      navigationItems: ReferralUtils.viewReferralNavigationItems(req.path, referral.id),
      pageHeading: `Referral to ${coursePresenter.nameAndAlternateName}`,
      person,
      referral,
    }
  }
}
