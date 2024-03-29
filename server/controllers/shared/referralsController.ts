import type { Request, Response, TypedRequestHandler } from 'express'
import createError from 'http-errors'

import { referPathBase } from '../../paths'
import type { CourseService, OrganisationService, PersonService, ReferralService, UserService } from '../../services'
import {
  CourseUtils,
  DateUtils,
  OffenceUtils,
  PersonUtils,
  SentenceInformationUtils,
  ShowReferralUtils,
  TypeUtils,
} from '../../utils'
import { releaseDateFields } from '../../utils/personUtils'
import type { ReferralSharedPageData } from '@accredited-programmes/ui'

export default class ReferralsController {
  constructor(
    private readonly courseService: CourseService,
    private readonly organisationService: OrganisationService,
    private readonly personService: PersonService,
    private readonly referralService: ReferralService,
    private readonly userService: UserService,
  ) {}

  additionalInformation(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const sharedPageData = await this.sharedPageData(req, res)
      const { referral } = sharedPageData

      if (referral.status === 'referral_started') {
        throw createError(400, 'Referral has not been submitted.')
      }

      return res.render('referrals/show/additionalInformation', {
        ...sharedPageData,
        submittedText: `Submitted in referral on ${DateUtils.govukFormattedFullDateString(referral.submittedOn)}.`,
      })
    }
  }

  offenceHistory(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const sharedPageData = await this.sharedPageData(req, res)
      const { referral } = sharedPageData

      if (referral.status === 'referral_started') {
        throw createError(400, 'Referral has not been submitted.')
      }

      const { additionalOffences, indexOffence } = await this.personService.getOffenceHistory(
        req.user.username,
        sharedPageData.person.prisonNumber,
      )

      return res.render('referrals/show/offenceHistory', {
        ...sharedPageData,
        additionalOffencesSummaryLists: additionalOffences.map(offence => ({
          summaryListRows: OffenceUtils.summaryListRows(offence),
          titleText: `Additional offence${offence.code ? ` (${offence.code})` : ''}`,
        })),
        hasOffenceHistory: Boolean(indexOffence) || additionalOffences.length > 0,
        importedFromText: `Imported from Nomis on ${DateUtils.govukFormattedFullDateString()}.`,
        indexOffenceSummaryListRows: indexOffence ? OffenceUtils.summaryListRows(indexOffence) : null,
      })
    }
  }

  personalDetails(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const sharedPageData = await this.sharedPageData(req, res)
      const { referral } = sharedPageData

      if (referral.status === 'referral_started') {
        throw createError(400, 'Referral has not been submitted.')
      }

      return res.render('referrals/show/personalDetails', {
        ...sharedPageData,
        importedFromText: `Imported from Nomis on ${DateUtils.govukFormattedFullDateString()}.`,
        personSummaryListRows: PersonUtils.summaryListRows(sharedPageData.person),
      })
    }
  }

  programmeHistory(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const sharedPageData = await this.sharedPageData(req, res)
      const { referral } = sharedPageData

      if (referral.status === 'referral_started') {
        throw createError(400, 'Referral has not been submitted.')
      }

      const courseParticipationSummaryListsOptions = await this.courseService.getAndPresentParticipationsByPerson(
        req.user.username,
        req.user.token,
        sharedPageData.person.prisonNumber,
        sharedPageData.referral.id,
        { change: false, remove: false },
      )

      return res.render('referrals/show/programmeHistory', {
        ...sharedPageData,
        courseParticipationSummaryListsOptions,
      })
    }
  }

  sentenceInformation(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const sharedPageData = await this.sharedPageData(req, res)
      const { person, referral } = sharedPageData

      if (referral.status === 'referral_started') {
        throw createError(400, 'Referral has not been submitted.')
      }

      const offenderSentenceAndOffences = await this.personService.getOffenderSentenceAndOffences(
        req.user.token,
        sharedPageData.person.bookingId,
      )

      const hasReleaseDates: boolean = releaseDateFields.some(field => !!person[field])

      const hasSentenceDetails: boolean = !!(
        person.sentenceStartDate || offenderSentenceAndOffences.sentenceTypeDescription
      )

      return res.render('referrals/show/sentenceInformation', {
        ...sharedPageData,
        detailsSummaryListRows: hasSentenceDetails
          ? SentenceInformationUtils.detailsSummaryListRows(
              person.sentenceStartDate,
              offenderSentenceAndOffences.sentenceTypeDescription,
            )
          : [],
        hasReleaseDates,
        hasSentenceDetails,
        importedFromText: `Imported from OASys on ${DateUtils.govukFormattedFullDateString()}.`,
        releaseDatesSummaryListRows: hasReleaseDates ? PersonUtils.releaseDatesSummaryListRows(person) : [],
      })
    }
  }

  private async sharedPageData(req: Request, res: Response): Promise<ReferralSharedPageData> {
    TypeUtils.assertHasUser(req)

    const { referralId } = req.params
    const { token: userToken, username } = req.user
    const { updatePerson } = req.query as Record<string, string>
    const isRefer = req.path.startsWith(referPathBase.pattern)

    const referral = await this.referralService.getReferral(username, referralId, { updatePerson })
    const [course, courseOffering, person, referrerUserFullName, statusTransitions] = await Promise.all([
      this.courseService.getCourseByOffering(username, referral.offeringId),
      this.courseService.getOffering(username, referral.offeringId),
      this.personService.getPerson(username, referral.prisonNumber, res.locals.user.caseloads),
      this.userService.getFullNameFromUsername(userToken, referral.referrerUsername),
      isRefer ? this.referralService.getStatusTransitions(username, referral.id) : undefined,
    ])

    const organisation = await this.organisationService.getOrganisation(userToken, courseOffering.organisationId)

    const coursePresenter = CourseUtils.presentCourse(course)

    return {
      buttons: ShowReferralUtils.buttons(req.path, referral, statusTransitions),
      courseOfferingSummaryListRows: ShowReferralUtils.courseOfferingSummaryListRows(
        coursePresenter,
        organisation.name,
      ),
      navigationItems: ShowReferralUtils.viewReferralNavigationItems(req.path, referral.id),
      pageHeading: `Referral to ${coursePresenter.nameAndAlternateName}`,
      pageSubHeading: 'Referral summary',
      person,
      referral,
      subNavigationItems: ShowReferralUtils.subNavigationItems(req.path, 'referral', referral.id),
      submissionSummaryListRows: ShowReferralUtils.submissionSummaryListRows(
        referral.submittedOn,
        referrerUserFullName,
      ),
    }
  }
}
