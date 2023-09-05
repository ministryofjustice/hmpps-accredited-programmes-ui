import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'

import ReferralsController from './referralsController'
import { referPaths } from '../../paths'
import type { CourseService, OrganisationService, PersonService, ReferralService } from '../../services'
import {
  courseAudienceFactory,
  courseFactory,
  courseOfferingFactory,
  organisationFactory,
  personFactory,
  referralFactory,
} from '../../testutils/factories'
import { CourseUtils, PersonUtils, ReferralUtils, TypeUtils } from '../../utils'
import type { CoursePresenter } from '@accredited-programmes/ui'

jest.mock('../../utils/courseUtils')

describe('ReferralsController', () => {
  const token = 'SOME_TOKEN'
  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const courseService = createMock<CourseService>({})
  const organisationService = createMock<OrganisationService>({})
  const personService = createMock<PersonService>({})
  const referralService = createMock<ReferralService>({})

  const course = courseFactory.build()
  const courseOffering = courseOfferingFactory.build()

  let referralsController: ReferralsController

  beforeEach(() => {
    referralsController = new ReferralsController(courseService, organisationService, personService, referralService)
    courseService.getCourseByOffering.mockResolvedValue(course)
    courseService.getOffering.mockResolvedValue(courseOffering)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('start', () => {
    it('renders the referral start template', async () => {
      const organisation = organisationFactory.build({ id: courseOffering.organisationId })
      organisationService.getOrganisation.mockResolvedValue(organisation)

      const requestHandler = referralsController.start()
      await requestHandler(request, response, next)

      const coursePresenter = createMock<CoursePresenter>({ name: course.name })
      ;(CourseUtils.presentCourse as jest.Mock).mockReturnValue(coursePresenter)

      expect(response.render).toHaveBeenCalledWith('referrals/start', {
        course: coursePresenter,
        courseOffering,
        organisation,
        pageHeading: 'Make a referral',
      })
    })

    describe('when the organisation service returns `null`', () => {
      it('responds with a 404', async () => {
        organisationService.getOrganisation.mockResolvedValue(null)

        const requestHandler = referralsController.start()
        const expectedError = createError(404)

        expect(() => requestHandler(request, response, next)).rejects.toThrowError(expectedError)
      })
    })
  })

  describe('new', () => {
    it('renders the referral new template', async () => {
      const courseId = course.id
      const courseOfferingId = courseOffering.id

      request.params.courseId = courseId
      request.params.courseOfferingId = courseOfferingId

      const requestHandler = referralsController.new()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/new', {
        courseId,
        courseOfferingId,
        pageHeading: "Enter the person's identifier",
      })
    })
  })

  describe('create', () => {
    it('asks the service to create a referral and redirects to the show action', async () => {
      const referral = referralFactory.build()

      request.body.courseOfferingId = referral.offeringId
      request.body.prisonNumber = referral.prisonNumber

      TypeUtils.assertHasUser(request)
      request.user.userId = referral.referrerId

      referralService.createReferral.mockResolvedValue({ referralId: referral.id })

      const requestHandler = referralsController.create()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(referPaths.show({ referralId: referral.id }))
      expect(referralService.createReferral).toHaveBeenCalledWith(
        token,
        referral.offeringId,
        referral.prisonNumber,
        referral.referrerId,
      )
    })
  })

  describe('show', () => {
    it('renders the referral task list page', async () => {
      const organisation = organisationFactory.build({ id: courseOffering.organisationId })
      organisationService.getOrganisation.mockResolvedValue(organisation)

      const person = personFactory.build()
      personService.getPerson.mockResolvedValue(person)

      const referral = referralFactory.build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })
      referralService.getReferral.mockResolvedValue(referral)

      const requestHandler = referralsController.show()
      await requestHandler(request, response, next)

      const coursePresenter = createMock<CoursePresenter>({ name: course.name })
      ;(CourseUtils.presentCourse as jest.Mock).mockReturnValue(coursePresenter)

      expect(response.render).toHaveBeenCalledWith('referrals/show', {
        course: coursePresenter,
        organisation,
        pageHeading: 'Make a referral',
        person,
        taskListSections: ReferralUtils.taskListSections(referral),
      })
    })

    describe('when the organisation service returns `null`', () => {
      it('responds with a 404', async () => {
        organisationService.getOrganisation.mockResolvedValue(null)

        const person = personFactory.build()
        personService.getPerson.mockResolvedValue(person)

        const referral = referralFactory.build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })
        referralService.getReferral.mockResolvedValue(referral)

        const requestHandler = referralsController.show()
        const expectedError = createError(404)

        expect(() => requestHandler(request, response, next)).rejects.toThrowError(expectedError)
      })
    })

    describe('when the person service returns `null`', () => {
      it('responds with a 404', async () => {
        const organisation = organisationFactory.build({ id: courseOffering.organisationId })
        organisationService.getOrganisation.mockResolvedValue(organisation)

        const person = personFactory.build()
        personService.getPerson.mockResolvedValue(null)

        const referral = referralFactory.build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })
        referralService.getReferral.mockResolvedValue(referral)

        const requestHandler = referralsController.show()
        const expectedError = createError(404)

        expect(() => requestHandler(request, response, next)).rejects.toThrowError(expectedError)
      })
    })
  })

  describe('checkAnswers', () => {
    it('renders the referral check answers page', async () => {
      const organisation = organisationFactory.build({ id: courseOffering.organisationId })
      organisationService.getOrganisation.mockResolvedValue(organisation)

      const person = personFactory.build()
      personService.getPerson.mockResolvedValue(person)

      const referral = referralFactory.build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })
      referralService.getReferral.mockResolvedValue(referral)

      request.params.referralId = referral.id

      TypeUtils.assertHasUser(request)
      request.user.username = 'BOBBY_BROWN'

      const coursePresenter = createMock<CoursePresenter>({
        audiences: courseAudienceFactory.buildList(1),
        nameAndAlternateName: `${course.name} (${course.alternateName})`,
      })
      ;(CourseUtils.presentCourse as jest.Mock).mockReturnValue(coursePresenter)

      const requestHandler = referralsController.checkAnswers()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/checkAnswers', {
        applicationSummaryListRows: ReferralUtils.applicationSummaryListRows(
          courseOffering,
          coursePresenter,
          organisation,
          person,
          request.user.username,
        ),
        pageHeading: 'Check your answers',
        person,
        personSummaryListRows: PersonUtils.summaryListRows(person),
        referralId: referral.id,
      })
    })
  })
})
