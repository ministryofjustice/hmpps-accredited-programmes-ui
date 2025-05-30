import { type Request, type Response, type TypedRequestHandler } from 'express'
import createError from 'http-errors'

import { authPaths, findPaths, referPaths } from '../../../paths'
import { type SanitisedError, isErrorWithData } from '../../../sanitisedError'
import type { CourseService, OrganisationService, PersonService, ReferralService, UserService } from '../../../services'
import { CourseUtils, FormUtils, NewReferralUtils, PersonUtils, TypeUtils } from '../../../utils'
import SexualOffenceDetailsUtils from '../../../utils/sexualOffenceDetailsUtils'
import type { Referral } from '@accredited-programmes-api'

export default class NewReferralsController {
  constructor(
    private readonly courseService: CourseService,
    private readonly organisationService: OrganisationService,
    private readonly personService: PersonService,
    private readonly referralService: ReferralService,
    private readonly userService: UserService,
  ) {}

  checkAnswers(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { referralId } = req.params

      const referral = await this.referralService.getReferral(req.user.username, referralId)

      if (referral.status !== 'referral_started') {
        return res.redirect(referPaths.new.complete({ referralId }))
      }

      if (referral.referrerUsername !== req.user.username) {
        return res.redirect(authPaths.error({}))
      }

      if (!NewReferralUtils.isReadyForSubmission(referral)) {
        return res.redirect(referPaths.new.show({ referralId }))
      }

      const [person, courseOffering, course, referrerName, referrerEmail] = await Promise.all([
        this.personService.getPerson(req.user.username, referral.prisonNumber),
        this.courseService.getOffering(req.user.username, referral.offeringId),
        this.courseService.getCourseByOffering(req.user.username, referral.offeringId),
        this.userService.getFullNameFromUsername(req.user.token, referral.referrerUsername),
        this.userService.getEmailFromUsername(req.user.token, referral.referrerUsername),
      ])

      const [organisation, participationsForReferral] = await Promise.all([
        this.organisationService.getOrganisationFromAcp(req.user.username, courseOffering.organisationId),
        this.courseService.getParticipationsByReferral(req.user.username, referralId),
      ])

      const participationSummaryListsOptions = await Promise.all(
        participationsForReferral.map(participation =>
          this.courseService.presentCourseParticipation(req.user.token, participation, referralId, undefined, {
            change: true,
            remove: false,
          }),
        ),
      )

      const coursePresenter = CourseUtils.presentCourse(course)
      const isHsp = CourseUtils.isHsp(course.name)

      let offenceAgainstMinorsSummaryListRows
      let offenceViolenceForceSummaryListRows
      let offenceOtherSummaryListRows
      let hspReferralDetails

      if (isHsp) {
        hspReferralDetails = await this.referralService.getHspReferralDetails(req.user.username, referralId)

        offenceAgainstMinorsSummaryListRows = SexualOffenceDetailsUtils.offenceSummaryListRows(
          hspReferralDetails.selectedOffences.filter(detail => detail.categoryCode === 'AGAINST_MINORS'),
        )

        offenceViolenceForceSummaryListRows = SexualOffenceDetailsUtils.offenceSummaryListRows(
          hspReferralDetails.selectedOffences.filter(
            detail => detail.categoryCode === 'INCLUDES_VIOLENCE_FORCE_HUMILIATION',
          ),
        )
        offenceOtherSummaryListRows = SexualOffenceDetailsUtils.offenceSummaryListRows(
          hspReferralDetails.selectedOffences.filter(detail => detail.categoryCode === 'OTHER'),
        )
      }

      FormUtils.setFieldErrors(req, res, ['confirmation'])

      const successMessage = req.flash('successMessage')[0]

      req.session.returnTo = 'check-answers'

      return res.render('referrals/new/checkAnswers', {
        additionalInformation: referral.additionalInformation,
        courseOfferingSummaryListRows: NewReferralUtils.courseOfferingSummaryListRows(
          courseOffering,
          coursePresenter,
          organisation,
          person,
        ),
        isHsp,
        offenceAgainstMinorsSummaryListRows,
        offenceOtherSummaryListRows,
        offenceViolenceForceSummaryListRows,
        pageHeading: 'Check your answers',
        participationSummaryListsOptions,
        person,
        personSummaryListRows: PersonUtils.summaryListRows(person),
        referralId,
        referrerOverrideReason: referral.referrerOverrideReason,
        referrerSummaryListRows: NewReferralUtils.referrerSummaryListRows(referrerName, referrerEmail),
        successMessage,
      })
    }
  }

  complete(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { referralId } = req.params

      const referral = await this.referralService.getReferral(req.user.username, referralId)

      if (referral.status !== 'referral_submitted') {
        throw createError(400, 'Referral has not been submitted.')
      }

      if (referral.referrerUsername !== req.user.username) {
        return res.redirect(authPaths.error({}))
      }

      return res.render('referrals/new/complete', {
        myReferralsLink: referPaths.caseList.index({}),
        pageHeading: 'Referral complete',
        pageTitleOverride: 'Referral complete',
      })
    }
  }

  create(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { courseOfferingId, prisonNumber } = req.body
      const { username } = req.user
      const { hspReferralData } = req.session

      const courseOffering = await this.courseService.getOffering(req.user.username, courseOfferingId)
      if (!courseOffering.referable) {
        throw createError(400, 'Course offering is not referable.')
      }

      try {
        const createReferralResponse = await this.referralService.createReferral(
          username,
          courseOfferingId,
          prisonNumber,
          hspReferralData
            ? {
                eligibilityOverrideReason: hspReferralData.eligibilityOverrideReason,
                selectedOffences: hspReferralData.selectedOffences,
              }
            : undefined,
        )

        return res.redirect(referPaths.new.show({ referralId: createReferralResponse.id }))
      } catch (error) {
        const sanitisedError = error as SanitisedError

        if (isErrorWithData<Referral>(sanitisedError) && sanitisedError.status === 409) {
          delete req.session.transferErrorData
          return res.redirect(referPaths.show.duplicate({ referralId: sanitisedError.data.id }))
        }

        throw createError(
          sanitisedError.status || 500,
          `Unable to create referral for prison number ${prisonNumber} to course offering ${courseOfferingId}`,
        )
      }
    }
  }

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { referralId } = req.params
      const { updatePerson } = req.query as { updatePerson?: string }

      const referral = await this.referralService.getReferral(req.user.username, referralId, { updatePerson })

      if (referral.status !== 'referral_started') {
        return res.redirect(referPaths.new.complete({ referralId }))
      }

      if (referral.referrerUsername !== req.user.username) {
        return res.redirect(authPaths.error({}))
      }

      const [course, courseOffering, person] = await Promise.all([
        this.courseService.getCourseByOffering(req.user.username, referral.offeringId),
        this.courseService.getOffering(req.user.username, referral.offeringId),
        this.personService.getPerson(req.user.username, referral.prisonNumber),
      ])
      const organisation = await this.organisationService.getOrganisationFromAcp(
        req.user.username,
        courseOffering.organisationId,
      )
      const coursePresenter = CourseUtils.presentCourse(course)

      delete req.session.returnTo

      return res.render('referrals/new/show', {
        course: coursePresenter,
        hrefs: {
          delete: referPaths.new.delete({ referralId }),
          draftReferrals: referPaths.caseList.show({ referralStatusGroup: 'draft' }),
        },
        organisation,
        pageHeading: 'Make a referral',
        pageTitleOverride: 'Referral tasks to complete',
        person,
        taskListSections: NewReferralUtils.taskListSections(referral),
      })
    }
  }

  showPerson(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { referralId } = req.params

      const referral = await this.referralService.getReferral(req.user.username, referralId)

      if (referral.status !== 'referral_started') {
        return res.redirect(referPaths.new.complete({ referralId }))
      }

      if (referral.referrerUsername !== req.user.username) {
        return res.redirect(authPaths.error({}))
      }

      const person = await this.personService.getPerson(req.user.username, referral.prisonNumber)

      return res.render('referrals/new/showPerson', {
        pageHeading: `${person.name}'s details`,
        pageTitleOverride: 'Personal details',
        person,
        personSummaryListRows: PersonUtils.summaryListRows(person),
        referralId,
      })
    }
  }

  start(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const pniFindPrisonNumber = req.session.pniFindAndReferData?.prisonNumber

      if (!pniFindPrisonNumber) {
        return res.redirect(findPaths.pniFind.personSearch({}))
      }

      const [course, courseOffering] = await Promise.all([
        this.courseService.getCourseByOffering(req.user.username, req.params.courseOfferingId),
        this.courseService.getOffering(req.user.username, req.params.courseOfferingId),
      ])
      const organisation = await this.organisationService.getOrganisationFromAcp(
        req.user.token,
        courseOffering.organisationId,
      )
      const coursePresenter = CourseUtils.presentCourse(course)

      return res.render('referrals/new/start', {
        course: coursePresenter,
        courseOffering,
        hrefs: {
          back: findPaths.offerings.show({ courseOfferingId: courseOffering.id }),
          start: referPaths.new.people.show({ courseOfferingId: courseOffering.id, prisonNumber: pniFindPrisonNumber }),
        },
        organisation,
        pageHeading: 'Make a referral',
        pageTitleOverride: 'Start referral',
      })
    }
  }

  submit(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { referralId } = req.params

      if (req.body.confirmation !== 'true') {
        req.flash('confirmationError', 'Tick the box to confirm the information you have provided is correct')

        return res.redirect(referPaths.new.checkAnswers({ referralId }))
      }

      const referral = await this.referralService.getReferral(req.user.username, referralId)

      if (referral.status !== 'referral_started') {
        return res.redirect(referPaths.new.complete({ referralId }))
      }

      if (referral.referrerUsername !== req.user.username) {
        return res.redirect(authPaths.error({}))
      }

      if (!NewReferralUtils.isReadyForSubmission(referral)) {
        return res.redirect(referPaths.new.show({ referralId }))
      }

      try {
        await this.referralService.submitReferral(req.user.username, referralId)

        return res.redirect(referPaths.new.complete({ referralId }))
      } catch (error) {
        const sanitisedError = error as SanitisedError

        if (isErrorWithData<Referral>(sanitisedError) && sanitisedError.status === 409) {
          delete req.session.transferErrorData
          return res.redirect(referPaths.show.duplicate({ referralId: sanitisedError.data.id }))
        }

        throw createError(sanitisedError.status || 500, `Unable to submit referral with id ${referralId}.`)
      }
    }
  }
}
