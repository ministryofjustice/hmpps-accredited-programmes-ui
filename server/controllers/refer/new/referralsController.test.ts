import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'

import NewReferralsController from './referralsController'
import { authPaths, referPaths } from '../../../paths'
import sanitiseError from '../../../sanitisedError'
import type { CourseService, OrganisationService, PersonService, ReferralService, UserService } from '../../../services'
import {
  courseAudienceFactory,
  courseFactory,
  courseOfferingFactory,
  organisationFactory,
  personFactory,
  referralFactory,
} from '../../../testutils/factories'
import Helpers from '../../../testutils/helpers'
import { CourseUtils, FormUtils, NewReferralUtils, PersonUtils, TypeUtils } from '../../../utils'
import type {
  CoursePresenter,
  GovukFrontendSummaryListRowWithKeyAndValue,
  GovukFrontendSummaryListWithRowsWithKeysAndValues,
} from '@accredited-programmes/ui'

jest.mock('../../../utils/courseUtils')
jest.mock('../../../utils/formUtils')
jest.mock('../../../utils/referrals/newReferralUtils')

const mockNewReferralUtils = NewReferralUtils as jest.Mocked<typeof NewReferralUtils>

describe('NewReferralsController', () => {
  const userToken = 'SOME_TOKEN'
  const username = 'SOME_USERNAME'
  const otherUsername = 'SOME_OTHER_USERNAME'
  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const courseService = createMock<CourseService>({})
  const organisationService = createMock<OrganisationService>({})
  const personService = createMock<PersonService>({})
  const referralService = createMock<ReferralService>({})
  const userService = createMock<UserService>({})

  const course = courseFactory.build()
  const referableCourseOffering = courseOfferingFactory.build({ referable: true })
  const person = personFactory.build({
    name: 'Del Hatton',
  })
  const referralId = 'A-REFERRAL-ID'
  const draftReferral = referralFactory.started().build({
    id: referralId,
    offeringId: referableCourseOffering.id,
    prisonNumber: person.prisonNumber,
    referrerUsername: username,
  })
  const submittableReferral = referralFactory.submittable().build({
    id: referralId,
    offeringId: referableCourseOffering.id,
    prisonNumber: person.prisonNumber,
    referrerUsername: username,
  })
  const submittedReferral = referralFactory.submitted().build({
    id: referralId,
    offeringId: referableCourseOffering.id,
    prisonNumber: person.prisonNumber,
    referrerUsername: username,
  })

  let controller: NewReferralsController

  beforeEach(() => {
    request = createMock<Request>({
      flash: jest.fn().mockReturnValue([]),
      user: { token: userToken, username },
    })
    response = Helpers.createMockResponseWithCaseloads()
    controller = new NewReferralsController(
      courseService,
      organisationService,
      personService,
      referralService,
      userService,
    )
    courseService.getOffering.mockResolvedValue(referableCourseOffering)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('start', () => {
    it('renders the referral start template', async () => {
      courseService.getCourseByOffering.mockResolvedValue(course)

      const organisation = organisationFactory.build({ id: referableCourseOffering.organisationId })
      organisationService.getOrganisation.mockResolvedValue(organisation)

      const requestHandler = controller.start()
      await requestHandler(request, response, next)

      const coursePresenter = createMock<CoursePresenter>({ name: course.name })
      ;(CourseUtils.presentCourse as jest.Mock).mockReturnValue(coursePresenter)

      expect(response.render).toHaveBeenCalledWith('referrals/new/start', {
        course: coursePresenter,
        courseOffering: referableCourseOffering,
        organisation,
        pageHeading: 'Make a referral',
      })
    })
  })

  describe('new', () => {
    const courseId = course.id
    const courseOfferingId = referableCourseOffering.id

    it('renders the referral new template', async () => {
      request.params.courseId = courseId
      request.params.courseOfferingId = courseOfferingId

      courseService.getCourseByOffering.mockResolvedValue(course)

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

      courseService.getOffering.mockResolvedValue(referableCourseOffering)

      TypeUtils.assertHasUser(request)

      referralService.createReferral.mockResolvedValue(referralFactory.started().build({ id: referralId }))

      const requestHandler = controller.create()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(referPaths.new.show({ referralId }))
      expect(courseService.getOffering).toHaveBeenCalledWith(username, referableCourseOffering.id)
      expect(referralService.createReferral).toHaveBeenCalledWith(
        username,
        draftReferral.offeringId,
        draftReferral.prisonNumber,
      )
    })

    describe('when the course offering is not referable', () => {
      it('responds with a 400', async () => {
        const nonReferableCourseOffering = courseOfferingFactory.build({ referable: false })
        request.body.courseOfferingId = nonReferableCourseOffering.id
        request.body.prisonNumber = draftReferral.prisonNumber

        courseService.getOffering.mockResolvedValue(nonReferableCourseOffering)

        TypeUtils.assertHasUser(request)

        const requestHandler = controller.create()
        const expectedError = createError(400, 'Course offering is not referable.')

        expect(() => requestHandler(request, response, next)).rejects.toThrowError(expectedError)
        expect(courseService.getOffering).toHaveBeenCalledWith(username, nonReferableCourseOffering.id)
      })
    })

    describe('when there is a duplicate referral', () => {
      it('redirects to the show duplicate action', async () => {
        const duplicateReferral = referralFactory.started().build({ id: referralId })
        const error = createError(409, 'Duplicate referral', { response: { body: duplicateReferral, status: 409 } })
        const sanitisedError = sanitiseError(error)

        referralService.createReferral.mockRejectedValue(sanitisedError)

        request.body.courseOfferingId = draftReferral.offeringId
        request.body.prisonNumber = draftReferral.prisonNumber

        courseService.getOffering.mockResolvedValue(referableCourseOffering)

        TypeUtils.assertHasUser(request)

        const requestHandler = controller.create()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(referPaths.show.duplicate({ referralId: duplicateReferral.id }))
      })
    })

    describe('when there is an error creating the referral', () => {
      it('re-throws the error', async () => {
        referralService.createReferral.mockRejectedValue(createError(500, 'An error occurred'))

        request.body.courseOfferingId = draftReferral.offeringId
        request.body.prisonNumber = draftReferral.prisonNumber

        courseService.getOffering.mockResolvedValue(referableCourseOffering)

        TypeUtils.assertHasUser(request)

        const requestHandler = controller.create()
        const expectedError = createError(
          500,
          `Unable to create referral for prison number ${draftReferral.prisonNumber} to course offering ${draftReferral.offeringId}`,
        )

        expect(() => requestHandler(request, response, next)).rejects.toThrowError(expectedError)
      })
    })
  })

  describe('show', () => {
    const organisation = organisationFactory.build({ id: referableCourseOffering.organisationId })

    beforeEach(() => {
      request.params.referralId = referralId
      request.session.returnTo = 'check-answers'
    })

    it('renders the referral task list page', async () => {
      courseService.getCourseByOffering.mockResolvedValue(course)

      organisationService.getOrganisation.mockResolvedValue(organisation)

      personService.getPerson.mockResolvedValue(person)
      referralService.getReferral.mockResolvedValue(draftReferral)

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      const coursePresenter = createMock<CoursePresenter>({ name: course.name })
      ;(CourseUtils.presentCourse as jest.Mock).mockReturnValue(coursePresenter)

      expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId, { updatePerson: undefined })
      expect(personService.getPerson).toHaveBeenCalledWith(username, draftReferral.prisonNumber)
      expect(request.session.returnTo).toBeUndefined()
      expect(response.render).toHaveBeenCalledWith('referrals/new/show', {
        course: coursePresenter,
        hrefs: {
          delete: '/refer/referrals/new/A-REFERRAL-ID/delete',
          draftReferrals: '/refer/referrals/case-list/draft',
        },
        organisation,
        pageHeading: 'Make a referral',
        person,
        taskListSections: NewReferralUtils.taskListSections(draftReferral),
      })
    })

    describe('when the referral has been requested with an `updatePerson` query', () => {
      it('calls `referralService.getReferral` with the same value', async () => {
        courseService.getCourseByOffering.mockResolvedValue(course)

        organisationService.getOrganisation.mockResolvedValue(organisation)

        personService.getPerson.mockResolvedValue(person)
        referralService.getReferral.mockResolvedValue(draftReferral)
        request.query.updatePerson = 'true'

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId, { updatePerson: 'true' })
      })
    })

    describe('when the referral has been submitted', () => {
      it('redirects to the referral confirmation action', async () => {
        referralService.getReferral.mockResolvedValue(submittedReferral)

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId, { updatePerson: undefined })
        expect(response.redirect).toHaveBeenCalledWith(referPaths.new.complete({ referralId }))
      })
    })

    describe('when the logged in user is not the referrer', () => {
      it('redirects to the auth error page', async () => {
        TypeUtils.assertHasUser(request)

        request.user.username = otherUsername

        referralService.getReferral.mockResolvedValue(draftReferral)

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(otherUsername, referralId, { updatePerson: undefined })
        expect(response.redirect).toHaveBeenCalledWith(authPaths.error({}))
      })
    })
  })

  describe('showPerson', () => {
    it("renders the page for viewing a person's details", async () => {
      courseService.getCourseByOffering.mockResolvedValue(course)
      personService.getPerson.mockResolvedValue(person)

      referralService.getReferral.mockResolvedValue(draftReferral)
      request.params.referralId = referralId

      const requestHandler = controller.showPerson()
      await requestHandler(request, response, next)

      expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
      expect(personService.getPerson).toHaveBeenCalledWith(username, draftReferral.prisonNumber)
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

    describe('when the logged in user is not the referrer', () => {
      it('redirects to the auth error page', async () => {
        TypeUtils.assertHasUser(request)

        request.params.referralId = referralId
        request.user.username = otherUsername

        referralService.getReferral.mockResolvedValue(draftReferral)

        const requestHandler = controller.showPerson()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(otherUsername, referralId)
        expect(response.redirect).toHaveBeenCalledWith(authPaths.error({}))
      })
    })
  })

  describe('checkAnswers', () => {
    const courseOfferingSummaryListRows: Array<GovukFrontendSummaryListRowWithKeyAndValue> = [
      { key: { text: 'Course offering item 1' }, value: { text: 'Value 1' } },
      { key: { text: 'Course offering item 2' }, value: { html: 'value 2' } },
    ]
    const referrerSummaryListRows: Array<GovukFrontendSummaryListRowWithKeyAndValue> = [
      { key: { text: 'Referrer item 1' }, value: { text: 'Value 1' } },
      { key: { text: 'Referrer item 2' }, value: { html: 'value 2' } },
    ]
    const referrerName = 'Bobby Brown'
    const referrerEmail = 'referrer.email@test-email.co.uk'
    const coursePresenter = createMock<CoursePresenter>({
      audience: courseAudienceFactory.build(),
    })
    const organisation = organisationFactory.build({ id: referableCourseOffering.organisationId })
    const summaryListOptions = 'summary list options' as unknown as GovukFrontendSummaryListWithRowsWithKeysAndValues

    beforeEach(() => {
      courseService.getCourseByOffering.mockResolvedValue(course)
      personService.getPerson.mockResolvedValue(person)
      userService.getFullNameFromUsername.mockResolvedValue(referrerName)
      userService.getEmailFromUsername.mockResolvedValue(referrerEmail)

      request.params.referralId = referralId
      referralService.getReferral.mockResolvedValue(submittableReferral)
      mockNewReferralUtils.isReadyForSubmission.mockReturnValue(true)
      mockNewReferralUtils.courseOfferingSummaryListRows.mockReturnValue(courseOfferingSummaryListRows)
      mockNewReferralUtils.referrerSummaryListRows.mockReturnValue(referrerSummaryListRows)

      TypeUtils.assertHasUser(request)

      organisationService.getOrganisation.mockResolvedValue(organisation)

      courseService.getCourse.mockResolvedValue(course)
      ;(CourseUtils.presentCourse as jest.Mock).mockReturnValue(coursePresenter)

      courseService.getAndPresentParticipationsByPerson.mockResolvedValue([summaryListOptions, summaryListOptions])

      const emptyErrorsLocal = { list: [], messages: {} }
      ;(FormUtils.setFieldErrors as jest.Mock).mockImplementation((_request, _response, _fields) => {
        response.locals.errors = emptyErrorsLocal
      })
    })

    it('renders the referral check answers page and sets the `returnTo` value in the sesssion', async () => {
      const requestHandler = controller.checkAnswers()
      await requestHandler(request, response, next)

      expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
      expect(personService.getPerson).toHaveBeenCalledWith(username, submittableReferral.prisonNumber)
      expect(userService.getFullNameFromUsername).toHaveBeenCalledWith(userToken, submittableReferral.referrerUsername)
      expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['confirmation'])
      expect(courseService.getAndPresentParticipationsByPerson).toHaveBeenCalledWith(
        username,
        userToken,
        person.prisonNumber,
        referralId,
        { change: true, remove: false },
      )
      expect(request.session.returnTo).toBe('check-answers')
      expect(response.render).toHaveBeenCalledWith('referrals/new/checkAnswers', {
        additionalInformation: submittableReferral.additionalInformation,
        courseOfferingSummaryListRows,
        pageHeading: 'Check your answers',
        participationSummaryListsOptions: [summaryListOptions, summaryListOptions],
        person,
        personSummaryListRows: PersonUtils.summaryListRows(person),
        referralId,
        referrerSummaryListRows,
      })
      expect(NewReferralUtils.courseOfferingSummaryListRows).toHaveBeenCalledWith(
        referableCourseOffering,
        coursePresenter,
        organisation,
        person,
      )
      expect(NewReferralUtils.referrerSummaryListRows).toHaveBeenCalledWith(referrerName, referrerEmail)
    })

    describe('when there is a success message', () => {
      it('passes the message to the template', async () => {
        const successMessage = 'A success message'
        ;(request.flash as jest.Mock).mockImplementation(() => [successMessage])

        const requestHandler = controller.checkAnswers()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'referrals/new/checkAnswers',
          expect.objectContaining({
            successMessage,
          }),
        )
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

    describe('when the logged in user is not the referrer', () => {
      it('redirects to the auth error page', async () => {
        TypeUtils.assertHasUser(request)

        request.params.referralId = referralId
        request.user.username = otherUsername

        referralService.getReferral.mockResolvedValue(submittableReferral)

        const requestHandler = controller.checkAnswers()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(otherUsername, referralId)
        expect(response.redirect).toHaveBeenCalledWith(authPaths.error({}))
      })
    })

    describe('when the referral is not ready for submission', () => {
      it('redirects to the show referral action', async () => {
        request.params.referralId = draftReferral.id
        referralService.getReferral.mockResolvedValue(draftReferral)
        ;(NewReferralUtils.isReadyForSubmission as jest.Mock).mockReturnValue(false)

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
      ;(NewReferralUtils.isReadyForSubmission as jest.Mock).mockReturnValue(true)

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
          'Tick the box to confirm the information you have provided is correct',
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

    describe('when the logged in user is not the referrer', () => {
      it('redirects to the auth error page', async () => {
        TypeUtils.assertHasUser(request)

        request.body.confirmation = 'true'
        request.params.referralId = referralId
        request.user.username = otherUsername

        referralService.getReferral.mockResolvedValue(submittableReferral)

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(otherUsername, referralId)
        expect(response.redirect).toHaveBeenCalledWith(authPaths.error({}))
      })
    })

    describe('when the referral is not ready for submission', () => {
      it('redirects to the show referral action', async () => {
        request.body.confirmation = 'true'

        referralService.getReferral.mockResolvedValue(draftReferral)
        request.params.referralId = referralId
        ;(NewReferralUtils.isReadyForSubmission as jest.Mock).mockReturnValue(false)

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
        expect(response.render).toHaveBeenCalledWith('referrals/new/complete', {
          myReferralsLink: referPaths.caseList.index({}),
          pageHeading: 'Referral complete',
        })
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

    describe('when the logged in user is not the referrer', () => {
      it('redirects to the auth error page', async () => {
        TypeUtils.assertHasUser(request)

        request.params.referralId = referralId
        request.user.username = otherUsername

        referralService.getReferral.mockResolvedValue(submittedReferral)

        const requestHandler = controller.complete()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(otherUsername, referralId)
        expect(response.redirect).toHaveBeenCalledWith(authPaths.error({}))
      })
    })
  })
})
