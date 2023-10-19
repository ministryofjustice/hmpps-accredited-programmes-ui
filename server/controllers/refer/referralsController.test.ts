import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'
import { when } from 'jest-when'

import ReferralsController from './referralsController'
import { referPaths } from '../../paths'
import type { CourseService, OrganisationService, PersonService, ReferralService } from '../../services'
import {
  courseAudienceFactory,
  courseFactory,
  courseOfferingFactory,
  courseParticipationFactory,
  organisationFactory,
  personFactory,
  referralFactory,
  userFactory,
} from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import {
  CourseParticipationUtils,
  CourseUtils,
  FormUtils,
  PersonUtils,
  ReferralUtils,
  StringUtils,
  TypeUtils,
} from '../../utils'
import type { CourseParticipationPresenter, CoursePresenter } from '@accredited-programmes/ui'

jest.mock('../../utils/courseUtils')
jest.mock('../../utils/courseParticipationUtils')
jest.mock('../../utils/formUtils')
jest.mock('../../utils/referralUtils')

describe('ReferralsController', () => {
  const token = 'SOME_TOKEN'
  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const courseService = createMock<CourseService>({})
  const organisationService = createMock<OrganisationService>({})
  const personService = createMock<PersonService>({})
  const referralService = createMock<ReferralService>({})

  const course = courseFactory.build()
  const courseOffering = courseOfferingFactory.build()

  let referralsController: ReferralsController

  beforeEach(() => {
    request = createMock<Request>({ user: { token } })
    response = Helpers.createMockResponseWithCaseloads()
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
  })

  describe('new', () => {
    const courseId = course.id
    const courseOfferingId = courseOffering.id

    it('renders the referral new template', async () => {
      request.params.courseId = courseId
      request.params.courseOfferingId = courseOfferingId

      const emptyErrorsLocal = { list: [], messages: {} }
      ;(FormUtils.setFieldErrors as jest.Mock).mockImplementation((_request, _response, _fields) => {
        response.locals.errors = emptyErrorsLocal
      })

      const requestHandler = referralsController.new()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/new', {
        courseId,
        courseOfferingId,
        pageHeading: "Enter the person's identifier",
      })

      expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['prisonNumber'])
    })
  })

  describe('create', () => {
    it('asks the service to create a referral and redirects to the show action', async () => {
      const referral = referralFactory.started().build()

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

      const referral = referralFactory
        .started()
        .build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })
      referralService.getReferral.mockResolvedValue(referral)
      ;(ReferralUtils.redirectIfSubmitted as jest.Mock).mockImplementation((_referral, _response) => {
        // Do nothing
      })

      const coursePresenter = createMock<CoursePresenter>({ name: course.name })
      ;(CourseUtils.presentCourse as jest.Mock).mockReturnValue(coursePresenter)

      const requestHandler = referralsController.show()
      await requestHandler(request, response, next)

      expect(referralService.getReferral).toHaveBeenCalledWith(token, request.params.referralId)
      expect(ReferralUtils.redirectIfSubmitted).toHaveBeenCalledWith(referral, response)
      expect(response.render).toHaveBeenCalledWith('referrals/show', {
        course: coursePresenter,
        organisation,
        pageHeading: 'Make a referral',
        person,
        taskListSections: ReferralUtils.taskListSections(referral),
      })
    })
  })

  describe('showPerson', () => {
    const person = personFactory.build({
      name: 'Del Hatton',
    })

    it("renders the page for viewing a person's details", async () => {
      personService.getPerson.mockResolvedValue(person)

      const referral = referralFactory.started().build({ prisonNumber: person.prisonNumber })
      referralService.getReferral.mockResolvedValue(referral)
      request.params.referralId = referral.id
      ;(ReferralUtils.redirectIfSubmitted as jest.Mock).mockImplementation((_referral, _response) => {
        // Do nothing
      })

      const requestHandler = referralsController.showPerson()
      await requestHandler(request, response, next)

      expect(referralService.getReferral).toHaveBeenCalledWith(token, request.params.referralId)
      expect(ReferralUtils.redirectIfSubmitted).toHaveBeenCalledWith(referral, response)
      expect(response.render).toHaveBeenCalledWith('referrals/showPerson', {
        pageHeading: "Del Hatton's details",
        person,
        personSummaryListRows: PersonUtils.summaryListRows(person),
        referralId: referral.id,
      })
    })
  })

  describe('checkAnswers', () => {
    it('renders the referral check answers page', async () => {
      const person = personFactory.build()
      personService.getPerson.mockResolvedValue(person)

      const referral = referralFactory
        .submittable()
        .build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })
      request.params.referralId = referral.id
      referralService.getReferral.mockResolvedValue(referral)
      ;(ReferralUtils.isReadyForSubmission as jest.Mock).mockReturnValue(true)
      ;(ReferralUtils.redirectIfSubmitted as jest.Mock).mockImplementation((_referral, _response) => {
        // Do nothing
      })

      TypeUtils.assertHasUser(request)
      request.user.username = 'BOBBY_BROWN'

      const organisation = organisationFactory.build({ id: courseOffering.organisationId })
      organisationService.getOrganisation.mockResolvedValue(organisation)

      const coursePresenter = createMock<CoursePresenter>({
        audiences: courseAudienceFactory.buildList(1),
        nameAndAlternateName: `${course.name} (${course.alternateName})`,
      })
      courseService.getCourse.mockResolvedValue(course)
      ;(CourseUtils.presentCourse as jest.Mock).mockReturnValue(coursePresenter)

      const addedByUser = userFactory.build()

      const earliestCourseParticipation = courseParticipationFactory.build({
        addedBy: addedByUser.username,
        createdAt: '2022-01-01T12:00:00.000Z',
      })
      const earliestCourseParticipationPresenter: CourseParticipationPresenter = {
        ...earliestCourseParticipation,
        addedByDisplayName: StringUtils.convertToTitleCase(addedByUser.name),
      }
      const latestCourseParticipation = courseParticipationFactory.build({
        addedBy: addedByUser.username,
        createdAt: '2023-01-01T12:00:00.000Z',
      })
      courseService.getParticipationsByPerson.mockResolvedValue([
        latestCourseParticipation,
        earliestCourseParticipation,
      ])
      const latestCourseParticipationPresenter: CourseParticipationPresenter = {
        ...latestCourseParticipation,
        addedByDisplayName: StringUtils.convertToTitleCase(addedByUser.name),
      }
      when(courseService.presentCourseParticipation)
        .calledWith(token, earliestCourseParticipation)
        .mockResolvedValue(earliestCourseParticipationPresenter)
      when(courseService.presentCourseParticipation)
        .calledWith(token, latestCourseParticipation)
        .mockResolvedValue(latestCourseParticipationPresenter)

      const summaryListOptions = 'summary list options'
      ;(CourseParticipationUtils.summaryListOptions as jest.Mock).mockImplementation(
        (_courseParticipation, _referralId, _withActions = { change: true, remove: true }) => {
          return summaryListOptions
        },
      )

      const requestHandler = referralsController.checkAnswers()
      await requestHandler(request, response, next)

      const emptyErrorsLocal = { list: [], messages: {} }
      ;(FormUtils.setFieldErrors as jest.Mock).mockImplementation((_request, _response, _fields) => {
        response.locals.errors = emptyErrorsLocal
      })

      expect(referralService.getReferral).toHaveBeenCalledWith(token, request.params.referralId)
      expect(ReferralUtils.redirectIfSubmitted).toHaveBeenCalledWith(referral, response)
      expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['confirmation'])
      expect(CourseParticipationUtils.summaryListOptions).toHaveBeenNthCalledWith(
        1,
        earliestCourseParticipationPresenter,
        referral.id,
        { change: true, remove: false },
      )
      expect(CourseParticipationUtils.summaryListOptions).toHaveBeenNthCalledWith(
        2,
        latestCourseParticipationPresenter,
        referral.id,
        { change: true, remove: false },
      )
      expect(response.render).toHaveBeenCalledWith('referrals/checkAnswers', {
        additionalInformation: referral.reason,
        applicationSummaryListRows: ReferralUtils.applicationSummaryListRows(
          courseOffering,
          coursePresenter,
          organisation,
          person,
          request.user.username,
        ),
        pageHeading: 'Check your answers',
        participationSummaryListsOptions: [summaryListOptions, summaryListOptions],
        person,
        personSummaryListRows: PersonUtils.summaryListRows(person),
        referralId: referral.id,
      })
    })

    describe('when the referral is not ready for submission', () => {
      it('redirects to the show referral action', async () => {
        const referral = referralFactory.started().build()
        request.params.referralId = referral.id
        referralService.getReferral.mockResolvedValue(referral)
        ;(ReferralUtils.isReadyForSubmission as jest.Mock).mockReturnValue(false)

        TypeUtils.assertHasUser(request)
        request.user.username = 'BOBBY_BROWN'

        const requestHandler = referralsController.checkAnswers()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(token, request.params.referralId)
        expect(ReferralUtils.redirectIfSubmitted).toHaveBeenCalledWith(referral, response)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.show({ referralId: referral.id }))
      })
    })
  })

  describe('submit', () => {
    const referral = referralFactory.submittable().build()

    beforeEach(() => {
      referralService.getReferral.mockResolvedValue(referral)
      request.params.referralId = referral.id
    })

    it('asks the service to update the referral status to submitted and redirects to the complete action', async () => {
      request.body.confirmation = 'true'

      referralService.getReferral.mockResolvedValue(referral)

      request.params.referralId = referral.id
      ;(ReferralUtils.isReadyForSubmission as jest.Mock).mockReturnValue(true)

      const requestHandler = referralsController.submit()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(referPaths.complete({ referralId: referral.id }))
      expect(referralService.getReferral).toHaveBeenCalledWith(token, request.params.referralId)
      expect(ReferralUtils.redirectIfSubmitted).toHaveBeenCalledWith(referral, response)
      expect(referralService.updateReferralStatus).toHaveBeenCalledWith(token, referral.id, 'referral_submitted')
    })

    describe('when the body is invalid', () => {
      it('calls flash with an appropriate error and redirects to the check answers action', async () => {
        request.body.confirmation = 'false'

        const requestHandler = referralsController.submit()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(token, request.params.referralId)
        expect(ReferralUtils.redirectIfSubmitted).toHaveBeenCalledWith(referral, response)
        expect(request.flash).toHaveBeenCalledWith(
          'confirmationError',
          'Confirm that the information you have provided is complete, accurate and up to date',
        )
        expect(response.redirect).toHaveBeenCalledWith(referPaths.checkAnswers({ referralId: referral.id }))
      })
    })

    describe('when the referral is not ready for submission', () => {
      it('redirects to the show referral action', async () => {
        request.body.confirmation = 'true'

        referralService.getReferral.mockResolvedValue(referral)

        request.params.referralId = referral.id
        ;(ReferralUtils.isReadyForSubmission as jest.Mock).mockReturnValue(false)

        const requestHandler = referralsController.submit()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(token, request.params.referralId)
        expect(ReferralUtils.redirectIfSubmitted).toHaveBeenCalledWith(referral, response)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.show({ referralId: referral.id }))
      })
    })
  })

  describe('complete', () => {
    describe('when the referral status is `referral_submitted`', () => {
      it('renders the referral complete page', async () => {
        const referral = referralFactory.submitted().build()
        referralService.getReferral.mockResolvedValue(referral)

        request.params.referralId = referral.id

        const requestHandler = referralsController.complete()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('referrals/complete', { pageHeading: 'Referral complete' })
      })
    })

    describe('when the referral status is `referral_started`', () => {
      it('responds with a 400', async () => {
        const referral = referralFactory.build({ status: 'referral_started' })
        referralService.getReferral.mockResolvedValue(referral)

        request.params.referralId = referral.id

        const requestHandler = referralsController.complete()
        const expectedError = createError(400)

        expect(() => requestHandler(request, response, next)).rejects.toThrowError(expectedError)
      })
    })
  })
})
