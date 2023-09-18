import type { Request, Response, TypedRequestHandler } from 'express'
import createError from 'http-errors'

import { referPaths } from '../../paths'
import type { CourseService, OrganisationService, PersonService, ReferralService } from '../../services'
import { CourseUtils, FormUtils, PersonUtils, ReferralUtils, TypeUtils } from '../../utils'
import type { CreatedReferralResponse, ReferralUpdate } from '@accredited-programmes/models'

export default class ReferralsController {
  constructor(
    private readonly courseService: CourseService,
    private readonly organisationService: OrganisationService,
    private readonly personService: PersonService,
    private readonly referralService: ReferralService,
  ) {}

  checkAnswers(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { referralId } = req.params
      const { username } = req.user

      const referral = await this.referralService.getReferral(req.user.token, referralId)

      if (!ReferralUtils.isReadyForSubmission(referral)) {
        return res.redirect(referPaths.show({ referralId: referral.id }))
      }

      const person = await this.personService.getPerson(req.user.token, referral.prisonNumber)

      if (!person) {
        throw createError(404, {
          userMessage: `Person with prison number ${req.params.prisonNumber} not found.`,
        })
      }

      const courseOffering = await this.courseService.getOffering(req.user.token, referral.offeringId)
      const organisation = await this.organisationService.getOrganisation(req.user.token, courseOffering.organisationId)

      if (!organisation) {
        throw createError(404, {
          userMessage: 'Organisation not found.',
        })
      }

      const course = await this.courseService.getCourseByOffering(req.user.token, referral.offeringId)
      const coursePresenter = CourseUtils.presentCourse(course)

      FormUtils.setFieldErrors(req, res, ['confirmation'])

      return res.render('referrals/checkAnswers', {
        applicationSummaryListRows: ReferralUtils.applicationSummaryListRows(
          courseOffering,
          coursePresenter,
          organisation,
          person,
          username,
        ),
        pageHeading: 'Check your answers',
        person,
        personSummaryListRows: PersonUtils.summaryListRows(person),
        referralId,
      })
    }
  }

  complete(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { referralId } = req.params

      const referral = await this.referralService.getReferral(req.user.token, referralId)

      if (referral.status !== 'referral_submitted') {
        throw createError(400, {
          userMessage: 'Referral has not been submitted.',
        })
      }

      res.render('referrals/complete', {
        pageHeading: 'Referral complete',
      })
    }
  }

  create(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { courseOfferingId, prisonNumber } = req.body
      const { token, userId } = req.user

      const createdReferralResponse: CreatedReferralResponse = await this.referralService.createReferral(
        token,
        courseOfferingId,
        prisonNumber,
        userId,
      )

      res.redirect(referPaths.show({ referralId: createdReferralResponse.referralId }))
    }
  }

  hasCourseHistory(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const referral = await this.referralService.getReferral(req.user.token, req.params.referralId)
      const person = await this.personService.getPerson(req.user.token, referral.prisonNumber)

      if (!person) {
        throw createError(404, {
          userMessage: `Person with prison number ${referral.prisonNumber} not found.`,
        })
      }

      const fieldLabel = `Are you aware of ${person.name} previously completing or starting an Accredited Programme?`

      res.render('referrals/hasCourseHistory', {
        fieldLabel,
        pageHeading: 'Add Accredited Programme history',
        person,
        referralId: referral.id,
      })
    }
  }

  new(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { courseId, courseOfferingId } = req.params

      FormUtils.setFieldErrors(req, res, ['prisonNumber'])

      res.render('referrals/new', {
        courseId,
        courseOfferingId,
        pageHeading: "Enter the person's identifier",
      })
    }
  }

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const referral = await this.referralService.getReferral(req.user.token, req.params.referralId)
      const course = await this.courseService.getCourseByOffering(req.user.token, referral.offeringId)
      const courseOffering = await this.courseService.getOffering(req.user.token, referral.offeringId)
      const organisation = await this.organisationService.getOrganisation(req.user.token, courseOffering.organisationId)
      const person = await this.personService.getPerson(req.user.token, referral.prisonNumber)

      if (!organisation) {
        throw createError(404, {
          userMessage: 'Organisation not found.',
        })
      }

      if (!person) {
        throw createError(404, {
          userMessage: `Person with prison number ${req.params.prisonNumber} not found.`,
        })
      }

      const coursePresenter = CourseUtils.presentCourse(course)

      res.render('referrals/show', {
        course: coursePresenter,
        organisation,
        pageHeading: 'Make a referral',
        person,
        taskListSections: ReferralUtils.taskListSections(referral),
      })
    }
  }

  showPerson(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const referral = await this.referralService.getReferral(req.user.token, req.params.referralId)
      const person = await this.personService.getPerson(req.user.token, referral.prisonNumber)

      if (!person) {
        throw createError(404, {
          userMessage: `Person with prison number ${req.params.prisonNumber} not found.`,
        })
      }

      res.render('referrals/showPerson', {
        pageHeading: `${person.name}'s details`,
        person,
        personSummaryListRows: PersonUtils.summaryListRows(person),
        referralId: referral.id,
      })
    }
  }

  start(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const course = await this.courseService.getCourseByOffering(req.user.token, req.params.courseOfferingId)
      const courseOffering = await this.courseService.getOffering(req.user.token, req.params.courseOfferingId)
      const organisation = await this.organisationService.getOrganisation(req.user.token, courseOffering.organisationId)

      if (!organisation) {
        throw createError(404, {
          userMessage: 'Organisation not found.',
        })
      }

      const coursePresenter = CourseUtils.presentCourse(course)

      res.render('referrals/start', {
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

      if (req.body.confirmation !== 'true') {
        req.flash(
          'confirmationError',
          'Confirm that the information you have provided is complete, accurate and up to date',
        )

        return res.redirect(referPaths.checkAnswers({ referralId: req.params.referralId }))
      }

      const referral = await this.referralService.getReferral(req.user.token, req.params.referralId)

      if (!ReferralUtils.isReadyForSubmission(referral)) {
        return res.redirect(referPaths.show({ referralId: referral.id }))
      }

      await this.referralService.updateReferralStatus(req.user.token, req.params.referralId, 'referral_submitted')

      return res.redirect(referPaths.complete({ referralId: req.params.referralId }))
    }
  }

  updateHasCourseHistory(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const referral = await this.referralService.getReferral(req.user.token, req.params.referralId)
      const { hasCourseHistory } = req.body

      const referralUpdate: ReferralUpdate = {
        hasCourseHistory,
        oasysConfirmed: referral.oasysConfirmed,
        reason: referral.reason,
      }

      await this.referralService.updateReferral(req.user.token, referral.id, referralUpdate)

      res.redirect(referPaths.show({ referralId: referral.id }))
    }
  }
}
