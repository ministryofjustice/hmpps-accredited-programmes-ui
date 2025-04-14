import type { Request, Response, TypedRequestHandler } from 'express'
import createError from 'http-errors'

import { assessPaths, findPaths, referPathBase, referPaths } from '../../paths'
import type { CourseService, OrganisationService, PersonService, ReferralService, UserService } from '../../services'
import {
  CourseParticipationUtils,
  CourseUtils,
  DateUtils,
  OffenceUtils,
  PersonUtils,
  SentenceInformationUtils,
  ShowReferralUtils,
  TypeUtils,
} from '../../utils'
import type { ReferralSharedPageData } from '@accredited-programmes/ui'
import type { Referral } from '@accredited-programmes-api'

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

      const pathways = await this.referralService.getPathways(req.user.username, referral.id)
      const showOverrideReason = Boolean(pathways.isOverride && referral.referrerOverrideReason)

      return res.render('referrals/show/additionalInformation', {
        ...sharedPageData,
        pniMismatchSummaryListRows: showOverrideReason
          ? ShowReferralUtils.pniMismatchSummaryListRows(
              pathways.recommended,
              pathways.requested,
              referral.referrerOverrideReason,
            )
          : [],
        showOverrideReason,
        submittedText: `Submitted in referral on ${DateUtils.govukFormattedFullDateString(referral.submittedOn)}.`,
      })
    }
  }

  duplicate(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      let withdrawButtonText: string | undefined
      const originalReferralId = req.session.transferErrorData?.originalReferralId
      const sharedPageData = await this.sharedPageData(req, res)

      if (originalReferralId) {
        const originalReferral = await this.referralService.getReferral(req.user.username, originalReferralId)
        const originalCourse = await this.courseService.getCourseByOffering(
          req.user.username,
          originalReferral.offeringId,
        )

        withdrawButtonText = `Withdraw original referral to ${originalCourse.name}`
      }

      return res.render('referrals/show/duplicate', {
        ...sharedPageData,
        hrefs: {
          back: originalReferralId
            ? assessPaths.show.personalDetails({ referralId: originalReferralId })
            : referPaths.new.people.show({
                courseOfferingId: sharedPageData.courseOffering.id as string,
                prisonNumber: sharedPageData.person.prisonNumber,
              }),
          programmes: findPaths.pniFind.recommendedProgrammes({}),
          withdraw: originalReferralId ? assessPaths.withdraw({ referralId: originalReferralId }) : undefined,
        },
        pageHeading: 'Duplicate referral found',
        pageTitleOverride: 'Duplicate referral found',
        summaryText: `A referral already exists for ${sharedPageData.person.name} to ${sharedPageData.course.displayName} at ${sharedPageData.organisation.name}.`,
        withdrawButtonText,
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
        importedFromText: `Imported from NOMIS on ${DateUtils.govukFormattedFullDateString()}.`,
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
        importedFromText: `Imported from NOMIS on ${DateUtils.govukFormattedFullDateString()}.`,
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

      const courseParticipations = await this.courseService.getParticipationsByPerson(
        req.user.username,
        sharedPageData.person.prisonNumber,
      )

      return res.render('referrals/show/programmeHistory', {
        ...sharedPageData,
        participationsTable: CourseParticipationUtils.table(
          courseParticipations,
          req.path,
          referral.id,
          'participations-table',
        ),
      })
    }
  }

  releaseDates(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const sharedPageData = await this.sharedPageData(req, res)
      const { referral } = sharedPageData

      if (referral.status === 'referral_started') {
        throw createError(400, 'Referral has not been submitted.')
      }

      const sentenceDetails = await this.personService.getSentenceDetails(
        req.user.username,
        sharedPageData.person.prisonNumber,
      )

      return res.render('referrals/show/releaseDates', {
        ...sharedPageData,
        importedFromText: `Imported from NOMIS on ${DateUtils.govukFormattedFullDateString()}.`,
        releaseDatesSummaryListRows: PersonUtils.releaseDatesSummaryListRows(sentenceDetails.keyDates),
      })
    }
  }

  sentenceInformation(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const sharedPageData = await this.sharedPageData(req, res)
      const { referral } = sharedPageData

      if (referral.status === 'referral_started') {
        throw createError(400, 'Referral has not been submitted.')
      }

      const sentenceDetails = await this.personService.getSentenceDetails(
        req.user.username,
        sharedPageData.person.prisonNumber,
      )

      return res.render('referrals/show/sentenceInformation', {
        ...sharedPageData,
        importedFromText: `Imported from NOMIS on ${DateUtils.govukFormattedFullDateString()}.`,
        sentencesSummaryLists: SentenceInformationUtils.summaryLists(sentenceDetails),
      })
    }
  }

  private async getTransferredReferralAdditionalInfo(
    username: Express.User['username'],
    isRefer: boolean,
    referral: Referral,
  ) {
    if (isRefer || !referral.originalReferralId) {
      return undefined
    }

    const originalReferral = await this.referralService.getReferral(username, referral.originalReferralId)
    const originalCourse = await this.courseService.getCourseByOffering(username, originalReferral.offeringId)

    return `There is no additional information for this referral because it was transferred from a previous referral to ${originalCourse.name}. </br></br>
    You can see <a href="${assessPaths.show.additionalInformation({ referralId: originalReferral.id })}">notes from the previous referral.</a>`
  }

  private async sharedPageData(req: Request, res: Response): Promise<ReferralSharedPageData> {
    TypeUtils.assertHasUser(req)

    const { referralId } = req.params
    const { token: userToken, username } = req.user
    const { updatePerson } = req.query as Record<string, string>
    const isRefer = req.path.startsWith(referPathBase.pattern)

    const referral = await this.referralService.getReferral(username, referralId, { updatePerson })

    const additionalInformation = referral.additionalInformation
      ? referral.additionalInformation
      : await this.getTransferredReferralAdditionalInfo(username, isRefer, referral)

    const [course, courseOffering, person, referrerUserFullName, referrerEmailAddress, statusTransitions] =
      await Promise.all([
        this.courseService.getCourseByOffering(username, referral.offeringId),
        this.courseService.getOffering(username, referral.offeringId),
        this.personService.getPerson(username, referral.prisonNumber),
        this.userService.getFullNameFromUsername(userToken, referral.referrerUsername),
        this.userService.getEmailFromUsername(userToken, referral.referrerUsername),
        isRefer ? this.referralService.getStatusTransitions(username, referral.id) : undefined,
      ])

    const organisation = await this.organisationService.getOrganisation(userToken, courseOffering.organisationId)

    const coursePresenter = CourseUtils.presentCourse(course)

    return {
      additionalInformation,
      buttonMenu: ShowReferralUtils.buttonMenu(course, referral, {
        currentPath: req.path,
        recentCaseListPath: req.session.recentCaseListPath,
      }),
      buttons: ShowReferralUtils.buttons(
        { currentPath: req.path, recentCaseListPath: req.session.recentCaseListPath },
        referral,
        statusTransitions,
      ),
      course,
      courseOffering,
      courseOfferingSummaryListRows: ShowReferralUtils.courseOfferingSummaryListRows(
        person.name,
        coursePresenter,
        courseOffering.contactEmail,
        organisation.name,
      ),
      hideTitleServiceName: true,
      navigationItems: ShowReferralUtils.viewReferralNavigationItems(req.path, referral.id),
      organisation,
      pageHeading: `Referral to ${coursePresenter.displayName}`,
      pageSubHeading: 'Referral summary',
      pageTitleOverride: `Referral details for referral to ${coursePresenter.displayName}`,
      person,
      referral,
      subNavigationItems: ShowReferralUtils.subNavigationItems(req.path, 'referral', referral.id),
      submissionSummaryListRows: ShowReferralUtils.submissionSummaryListRows(
        referral.submittedOn,
        referrerUserFullName,
        referrerEmailAddress,
        referral.primaryPrisonOffenderManager,
      ),
    }
  }
}
