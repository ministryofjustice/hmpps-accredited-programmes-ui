import type { Request, Response, TypedRequestHandler } from 'express'
import createError from 'http-errors'

import { referPaths } from '../../paths'
import type { CourseService, OrganisationService, PersonService, ReferralService } from '../../services'
import { CourseUtils, PersonUtils, ReferralUtils, TypeUtils } from '../../utils'
import type { CreatedReferralResponse } from '@accredited-programmes/models'

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

      res.render('referrals/checkAnswers', {
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

  confirmOasys(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const referral = await this.referralService.getReferral(req.user.token, req.params.referralId)
      const person = await this.personService.getPerson(req.user.token, referral.prisonNumber)

      if (!person) {
        throw createError(404, {
          userMessage: `Person with prison number ${req.params.prisonNumber} not found.`,
        })
      }

      res.render('referrals/confirmOasys', {
        pageHeading: 'Confirm the OASys information',
        person,
        referral,
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

  new(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { courseId, courseOfferingId } = req.params

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
}
