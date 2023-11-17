import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'

import NewReferralsController from './referralsController'
import { referPaths } from '../../../paths'
import type { CourseService, OrganisationService, PersonService, ReferralService } from '../../../services'
import {
  courseAudienceFactory,
  courseFactory,
  courseOfferingFactory,
  organisationFactory,
  personFactory,
  referralFactory,
} from '../../../testutils/factories'
import Helpers from '../../../testutils/helpers'
import { CourseUtils, FormUtils, PersonUtils, ReferralUtils, TypeUtils } from '../../../utils'
import type { CoursePresenter, GovukFrontendSummaryListWithRowsWithKeysAndValues } from '@accredited-programmes/ui'

jest.mock('../../../utils/courseUtils')
jest.mock('../../../utils/formUtils')
jest.mock('../../../utils/referralUtils')

describe('NewReferralsController', () => {
  const userToken = 'SOME_TOKEN'
  const username = 'SOME_USERNAME'
  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const courseService = createMock<CourseService>({})
  const organisationService = createMock<OrganisationService>({})
  const personService = createMock<PersonService>({})
  const referralService = createMock<ReferralService>({})

  const referableCourse = courseFactory.build({ referable: true })
  const courseOffering = courseOfferingFactory.build()
  const person = personFactory.build({
    name: 'Del Hatton',
  })
  const referralId = 'A-REFERRAL-ID'
  const draftReferral = referralFactory
    .started()
    .build({ id: referralId, offeringId: courseOffering.id, prisonNumber: person.prisonNumber })
  const submittableReferral = referralFactory
    .submittable()
    .build({ id: referralId, offeringId: courseOffering.id, prisonNumber: person.prisonNumber })
  const submittedReferral = referralFactory
    .submitted()
    .build({ id: referralId, offeringId: courseOffering.id, prisonNumber: person.prisonNumber })

  let controller: NewReferralsController

  beforeEach(() => {
    request = createMock<Request>({ user: { token: userToken, username } })
    response = Helpers.createMockResponseWithCaseloads()
    controller = new NewReferralsController(courseService, organisationService, personService, referralService)
    courseService.getOffering.mockResolvedValue(courseOffering)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('start', () => {
    it('renders the referral start template', async () => {
      courseService.getCourseByOffering.mockResolvedValue(referableCourse)

      const organisation = organisationFactory.build({ id: courseOffering.organisationId })
      organisationService.getOrganisation.mockResolvedValue(organisation)

      const requestHandler = controller.start()
      await requestHandler(request, response, next)

      const coursePresenter = createMock<CoursePresenter>({ name: referableCourse.name })
      ;(CourseUtils.presentCourse as jest.Mock).mockReturnValue(coursePresenter)

      expect(response.render).toHaveBeenCalledWith('referrals/new/start', {
        course: coursePresenter,
        courseOffering,
        organisation,
        pageHeading: 'Make a referral',
      })
    })
  })

  describe('new', () => {
    const courseId = referableCourse.id
    const courseOfferingId = courseOffering.id

    it('renders the referral new template', async () => {
      request.params.courseId = courseId
      request.params.courseOfferingId = courseOfferingId

      courseService.getCourseByOffering.mockResolvedValue(referableCourse)

      const emptyErrorsLocal = { list: [], messages: {} }
      ;(FormUtils.setFieldErrors as jest.Mock).mockImplementation((_request, _response, _fields) => {
        response.locals.errors = emptyErrorsLocal
      })

      const requestHandler = controller.new()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/new/new', {
        courseId,
        courseOfferingId,
        pageHeading: "Enter the person's identifier",
      })

      expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['prisonNumber'])
    })
  })

  describe('create', () => {
    it('asks the service to create a referral and redirects to the show action', async () => {
      request.body.courseOfferingId = draftReferral.offeringId
      request.body.prisonNumber = draftReferral.prisonNumber

      courseService.getCourseByOffering.mockResolvedValue(referableCourse)

      TypeUtils.assertHasUser(request)
      request.user.userId = draftReferral.referrerId

      referralService.createReferral.mockResolvedValue({ referralId })

      const requestHandler = controller.create()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(referPaths.new.show({ referralId }))
      expect(courseService.getCourseByOffering).toHaveBeenCalledWith(username, courseOffering.id)
      expect(referralService.createReferral).toHaveBeenCalledWith(
        username,
        draftReferral.offeringId,
        draftReferral.prisonNumber,
        draftReferral.referrerId,
      )
    })

    describe('when the course is not referable', () => {
      it('responds with a 400', async () => {
        request.body.courseOfferingId = draftReferral.offeringId
        request.body.prisonNumber = draftReferral.prisonNumber

        const nonReferableCourse = courseFactory.build({ referable: false })
        courseService.getCourseByOffering.mockResolvedValue(nonReferableCourse)

        TypeUtils.assertHasUser(request)
        request.user.userId = draftReferral.referrerId

        const requestHandler = controller.create()
        const expectedError = createError(400, 'Course is not referable.')

        expect(() => requestHandler(request, response, next)).rejects.toThrowError(expectedError)
        expect(courseService.getCourseByOffering).toHaveBeenCalledWith(username, courseOffering.id)
      })
    })
  })

  describe('show', () => {
    it('renders the referral task list page', async () => {
      courseService.getCourseByOffering.mockResolvedValue(referableCourse)

      const organisation = organisationFactory.build({ id: courseOffering.organisationId })
      organisationService.getOrganisation.mockResolvedValue(organisation)

      personService.getPerson.mockResolvedValue(person)
      referralService.getReferral.mockResolvedValue(draftReferral)
      request.params.referralId = referralId

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      const coursePresenter = createMock<CoursePresenter>({ name: referableCourse.name })
      ;(CourseUtils.presentCourse as jest.Mock).mockReturnValue(coursePresenter)

      expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
      expect(response.render).toHaveBeenCalledWith('referrals/new/show', {
        course: coursePresenter,
        organisation,
        pageHeading: 'Make a referral',
        person,
        taskListSections: ReferralUtils.taskListSections(draftReferral),
      })
    })

    describe('when the referral has been submitted', () => {
      it('redirects to the referral confirmation action', async () => {
        request.params.referralId = referralId
        referralService.getReferral.mockResolvedValue(submittedReferral)

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.new.complete({ referralId }))
      })
    })
  })

  describe('showPerson', () => {
    it("renders the page for viewing a person's details", async () => {
      courseService.getCourseByOffering.mockResolvedValue(referableCourse)
      personService.getPerson.mockResolvedValue(person)

      referralService.getReferral.mockResolvedValue(draftReferral)
      request.params.referralId = referralId

      const requestHandler = controller.showPerson()
      await requestHandler(request, response, next)

      expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
      expect(response.render).toHaveBeenCalledWith('referrals/new/showPerson', {
        pageHeading: "Del Hatton's details",
        person,
        personSummaryListRows: PersonUtils.summaryListRows(person),
        referralId,
      })
    })

    describe('when the referral has been submitted', () => {
      it('redirects to the referral confirmation action', async () => {
        request.params.referralId = referralId
        referralService.getReferral.mockResolvedValue(submittedReferral)

        const requestHandler = controller.showPerson()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.new.complete({ referralId }))
      })
    })
  })

  describe('checkAnswers', () => {
    it('renders the referral check answers page', async () => {
      courseService.getCourseByOffering.mockResolvedValue(referableCourse)
      personService.getPerson.mockResolvedValue(person)

      request.params.referralId = referralId
      referralService.getReferral.mockResolvedValue(submittableReferral)
      ;(ReferralUtils.isReadyForSubmission as jest.Mock).mockReturnValue(true)

      TypeUtils.assertHasUser(request)

      const organisation = organisationFactory.build({ id: courseOffering.organisationId })
      organisationService.getOrganisation.mockResolvedValue(organisation)

      const coursePresenter = createMock<CoursePresenter>({
        audiences: courseAudienceFactory.buildList(1),
        nameAndAlternateName: `${referableCourse.name} (${referableCourse.alternateName})`,
      })
      courseService.getCourse.mockResolvedValue(referableCourse)
      ;(CourseUtils.presentCourse as jest.Mock).mockReturnValue(coursePresenter)

      const summaryListOptions = 'summary list options' as unknown as GovukFrontendSummaryListWithRowsWithKeysAndValues
      courseService.getAndPresentParticipationsByPerson.mockResolvedValue([summaryListOptions, summaryListOptions])

      const requestHandler = controller.checkAnswers()
      await requestHandler(request, response, next)

      const emptyErrorsLocal = { list: [], messages: {} }
      ;(FormUtils.setFieldErrors as jest.Mock).mockImplementation((_request, _response, _fields) => {
        response.locals.errors = emptyErrorsLocal
      })

      expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
      expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['confirmation'])
      expect(courseService.getAndPresentParticipationsByPerson).toHaveBeenCalledWith(
        username,
        userToken,
        person.prisonNumber,
        referralId,
        { change: true, remove: false },
      )
      expect(response.render).toHaveBeenCalledWith('referrals/new/checkAnswers', {
        additionalInformation: submittableReferral.additionalInformation,
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
        referralId,
      })
    })

    describe('when the referral has been submitted', () => {
      it('redirects to the referral confirmation action', async () => {
        request.params.referralId = referralId
        referralService.getReferral.mockResolvedValue(submittedReferral)

        const requestHandler = controller.checkAnswers()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.new.complete({ referralId }))
      })
    })

    describe('when the referral is not ready for submission', () => {
      it('redirects to the show referral action', async () => {
        request.params.referralId = draftReferral.id
        referralService.getReferral.mockResolvedValue(draftReferral)
        ;(ReferralUtils.isReadyForSubmission as jest.Mock).mockReturnValue(false)

        TypeUtils.assertHasUser(request)

        const requestHandler = controller.checkAnswers()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.new.show({ referralId }))
      })
    })
  })

  describe('submit', () => {
    beforeEach(() => {
      request.params.referralId = referralId
    })

    it('asks the service to update the referral status to submitted and redirects to the complete action', async () => {
      referralService.getReferral.mockResolvedValue(submittableReferral)
      request.body.confirmation = 'true'

      request.params.referralId = referralId
      ;(ReferralUtils.isReadyForSubmission as jest.Mock).mockReturnValue(true)

      const requestHandler = controller.submit()
      await requestHandler(request, response, next)

      expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
      expect(response.redirect).toHaveBeenCalledWith(referPaths.new.complete({ referralId }))
      expect(referralService.submitReferral).toHaveBeenCalledWith(username, referralId)
    })

    describe('when the body is invalid', () => {
      it('calls flash with an appropriate error and redirects to the check answers action', async () => {
        request.body.confirmation = 'false'

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(request.flash).toHaveBeenCalledWith(
          'confirmationError',
          'Confirm that the information you have provided is complete, accurate and up to date',
        )
        expect(response.redirect).toHaveBeenCalledWith(referPaths.new.checkAnswers({ referralId }))
      })
    })

    describe('when the referral has been submitted', () => {
      it('redirects to the referral confirmation action', async () => {
        request.body.confirmation = 'true'
        request.params.referralId = referralId
        referralService.getReferral.mockResolvedValue(submittedReferral)

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.new.complete({ referralId }))
      })
    })

    describe('when the referral is not ready for submission', () => {
      it('redirects to the show referral action', async () => {
        request.body.confirmation = 'true'

        referralService.getReferral.mockResolvedValue(draftReferral)
        request.params.referralId = referralId
        ;(ReferralUtils.isReadyForSubmission as jest.Mock).mockReturnValue(false)

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.new.show({ referralId }))
      })
    })
  })

  describe('complete', () => {
    describe('when the referral status is `referral_submitted`', () => {
      it('renders the referral complete page', async () => {
        referralService.getReferral.mockResolvedValue(submittedReferral)

        request.params.referralId = referralId

        const requestHandler = controller.complete()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
        expect(response.render).toHaveBeenCalledWith('referrals/new/complete', { pageHeading: 'Referral complete' })
      })
    })

    describe('when the referral status is `referral_started`', () => {
      it('responds with a 400', async () => {
        referralService.getReferral.mockResolvedValue(draftReferral)

        request.params.referralId = referralId

        const requestHandler = controller.complete()
        const expectedError = createError(400, 'Referral has not been submitted.')

        expect(() => requestHandler(request, response, next)).rejects.toThrowError(expectedError)
        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
      })
    })
  })
})
