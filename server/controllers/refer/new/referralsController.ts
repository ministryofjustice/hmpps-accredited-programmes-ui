import type { Request, Response, TypedRequestHandler } from 'express'
import createError from 'http-errors'

import { authPaths, referPaths } from '../../../paths'
import type { CourseService, OrganisationService, PersonService, ReferralService, UserService } from '../../../services'
import { CourseUtils, FormUtils, NewReferralUtils, PersonUtils, TypeUtils } from '../../../utils'
import type { CreatedReferralResponse } from '@accredited-programmes/models'

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
        this.personService.getPerson(req.user.username, referral.prisonNumber, res.locals.user.caseloads),
        this.courseService.getOffering(req.user.token, referral.offeringId),
        this.courseService.getCourseByOffering(req.user.token, referral.offeringId),
        this.userService.getFullNameFromUsername(req.user.token, referral.referrerUsername),
        this.userService.getEmailFromUsername(req.user.token, referral.referrerUsername),
      ])

      const [organisation, participationSummaryListsOptions] = await Promise.all([
        this.organisationService.getOrganisation(req.user.token, courseOffering.organisationId),
        this.courseService.getAndPresentParticipationsByPerson(
          req.user.username,
          req.user.token,
          person.prisonNumber,
          referralId,
          { change: true, remove: false },
        ),
      ])

      const coursePresenter = CourseUtils.presentCourse(course)

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
        pageHeading: 'Check your answers',
        participationSummaryListsOptions,
        person,
        personSummaryListRows: PersonUtils.summaryListRows(person),
        referralId,
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
      })
    }
  }

  create(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { courseOfferingId, prisonNumber } = req.body
      const { username } = req.user

      const courseOffering = await this.courseService.getOffering(req.user.username, courseOfferingId)
      if (!courseOffering.referable) {
        throw createError(400, 'Course offering is not referable.')
      }

      const createdReferralResponse: CreatedReferralResponse = await this.referralService.createReferral(
        username,
        courseOfferingId,
        prisonNumber,
      )

      res.redirect(referPaths.new.show({ referralId: createdReferralResponse.referralId }))
    }
  }

  new(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { courseId, courseOfferingId } = req.params

      FormUtils.setFieldErrors(req, res, ['prisonNumber'])

      res.render('referrals/new/new', {
        courseId,
        courseOfferingId,
        pageHeading: "Enter the person's identifier",
      })
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

      const course = await this.courseService.getCourseByOffering(req.user.token, referral.offeringId)
      const courseOffering = await this.courseService.getOffering(req.user.token, referral.offeringId)
      const organisation = await this.organisationService.getOrganisation(req.user.token, courseOffering.organisationId)
      const person = await this.personService.getPerson(
        req.user.username,
        referral.prisonNumber,
        res.locals.user.caseloads,
      )
      const coursePresenter = CourseUtils.presentCourse(course)

      delete req.session.returnTo

      return res.render('referrals/new/show', {
        course: coursePresenter,
        organisation,
        pageHeading: 'Make a referral',
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

      const person = await this.personService.getPerson(
        req.user.username,
        referral.prisonNumber,
        res.locals.user.caseloads,
      )

      return res.render('referrals/new/showPerson', {
        pageHeading: `${person.name}'s details`,
        person,
        personSummaryListRows: PersonUtils.summaryListRows(person),
        referralId,
      })
    }
  }

  start(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const course = await this.courseService.getCourseByOffering(req.user.token, req.params.courseOfferingId)
      const courseOffering = await this.courseService.getOffering(req.user.token, req.params.courseOfferingId)
      const organisation = await this.organisationService.getOrganisation(req.user.token, courseOffering.organisationId)
      const coursePresenter = CourseUtils.presentCourse(course)

      res.render('referrals/new/start', {
        course: coursePresenter,
        courseOffering,
        organisation,
        pageHeading: 'Make a referral',
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

      await this.referralService.submitReferral(req.user.username, referralId)

      return res.redirect(referPaths.new.complete({ referralId }))
    }
  }
}
