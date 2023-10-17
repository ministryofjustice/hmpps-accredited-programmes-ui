import type { Request, Response, TypedRequestHandler } from 'express'
import createError from 'http-errors'

import { referPaths } from '../../paths'
import type { CourseService, OrganisationService, PersonService, ReferralService, UserService } from '../../services'
import { CourseParticipationUtils, CourseUtils, FormUtils, PersonUtils, ReferralUtils, TypeUtils } from '../../utils'
import type { CourseParticipation, CreatedReferralResponse } from '@accredited-programmes/models'
import type { CourseParticipationPresenter } from '@accredited-programmes/ui'

export default class ReferralsController {
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
      const { username } = req.user

      const referral = await this.referralService.getReferral(req.user.token, referralId)

      if (!ReferralUtils.isReadyForSubmission(referral)) {
        return res.redirect(referPaths.show({ referralId: referral.id }))
      }

      const person = await this.personService.getPerson(
        req.user.username,
        referral.prisonNumber,
        res.locals.user.caseloads,
      )
      const courseOffering = await this.courseService.getOffering(req.user.token, referral.offeringId)
      const organisation = await this.organisationService.getOrganisation(req.user.token, courseOffering.organisationId)
      const course = await this.courseService.getCourseByOffering(req.user.token, referral.offeringId)
      const courseParticipations = await this.courseService.getParticipationsByPerson(
        req.user.token,
        person.prisonNumber,
      )

      const presentedCourseParticipations = (
        await this.presentCourseParticipations(courseParticipations, req.user.token)
      ).sort((participationA, participationB) => participationA.createdAt.localeCompare(participationB.createdAt))
      const participationSummaryListsOptions = presentedCourseParticipations.map(participation =>
        CourseParticipationUtils.summaryListOptions(participation, referral.id, { change: true, remove: false }),
      )

      const coursePresenter = CourseUtils.presentCourse(course)

      FormUtils.setFieldErrors(req, res, ['confirmation'])

      return res.render('referrals/checkAnswers', {
        additionalInformation: referral.reason,
        applicationSummaryListRows: ReferralUtils.applicationSummaryListRows(
          courseOffering,
          coursePresenter,
          organisation,
          person,
          username,
        ),
        pageHeading: 'Check your answers',
        participationSummaryListsOptions,
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
      const person = await this.personService.getPerson(
        req.user.username,
        referral.prisonNumber,
        res.locals.user.caseloads,
      )
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
      const person = await this.personService.getPerson(
        req.user.username,
        referral.prisonNumber,
        res.locals.user.caseloads,
      )

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

  private async presentCourseParticipations(
    courseParticipations: Array<CourseParticipation>,
    token: Express.User['token'],
  ): Promise<Array<CourseParticipationPresenter>> {
    return Promise.all(
      courseParticipations.map(async courseParticipation => {
        let name = ''

        if (courseParticipation.courseId) {
          const course = await this.courseService.getCourse(token, courseParticipation.courseId)
          name = course.name
        } else {
          name = courseParticipation.otherCourseName as CourseParticipationPresenter['name']
        }

        const addedByUser = await this.userService.getUserFromUsername(token, courseParticipation.addedBy)

        return { ...courseParticipation, addedByName: addedByUser.name, name }
      }),
    )
  }
}
