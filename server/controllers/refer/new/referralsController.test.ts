import type { DeepMocked } from '@golevelup/ts-jest'
import { faker } from '@faker-js/faker/locale/en_GB'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'
import { when } from 'jest-when'

import NewReferralsController from './referralsController'
import { authPaths, findPaths, referPaths } from '../../../paths'
import sanitiseError from '../../../sanitisedError'
import type { CourseService, OrganisationService, PersonService, ReferralService, UserService } from '../../../services'
import {
  audienceFactory,
  courseFactory,
  courseOfferingFactory,
  courseParticipationFactory,
  hspReferralDetailsFactory,
  personFactory,
  referralFactory,
  sexualOffenceDetailsFactory,
} from '../../../testutils/factories'
import Helpers from '../../../testutils/helpers'
import { CourseUtils, FormUtils, NewReferralUtils, PersonUtils, TypeUtils } from '../../../utils'
import SexualOffenceDetailsUtils from '../../../utils/sexualOffenceDetailsUtils'
import type {
  CoursePresenter,
  GovukFrontendSummaryListRowWithKeyAndValue,
  GovukFrontendSummaryListWithRowsWithKeysAndValues,
} from '@accredited-programmes/ui'
import type { Organisation } from '@accredited-programmes-api'


jest.mock('../../../utils/courseUtils')
jest.mock('../../../utils/formUtils')
jest.mock('../../../utils/referrals/newReferralUtils')

const mockNewReferralUtils = NewReferralUtils as jest.Mocked<typeof NewReferralUtils>
const mockCourseUtils = CourseUtils as jest.Mocked<typeof CourseUtils>

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
      session: {
        pniFindAndReferData: {
          prisonNumber: person.prisonNumber,
          programmePathway: 'HIGH_INTENSITY_BC',
        },
        transferErrorData: {
          errorMessage: 'DUPLICATE',
          originalReferralId: 'original-referral-id',
          prisonNumber: person.prisonNumber,
        },
      },
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

    when(courseService.getOffering)
      .calledWith(username, referableCourseOffering.id)
      .mockResolvedValue(referableCourseOffering)
    when(courseService.getCourseByOffering).calledWith(username, referableCourseOffering.id).mockResolvedValue(course)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('start', () => {
    beforeEach(() => {
      request.params.courseOfferingId = referableCourseOffering.id
    })

    it('renders the referral start template', async () => {
      const organisation: Organisation = { code: referableCourseOffering.organisationId, prisonName: 'HMP Test' }
      organisationService.getOrganisationFromAcp.mockResolvedValue(organisation)

      const requestHandler = controller.start()
      await requestHandler(request, response, next)

      const coursePresenter = createMock<CoursePresenter>({ name: course.name })
        ; (CourseUtils.presentCourse as jest.Mock).mockReturnValue(coursePresenter)

      expect(response.render).toHaveBeenCalledWith('referrals/new/start', {
        course: coursePresenter,
        courseOffering: referableCourseOffering,
        hrefs: {
          back: findPaths.offerings.show({ courseOfferingId: referableCourseOffering.id }),
          start: referPaths.new.people.show({
            courseOfferingId: referableCourseOffering.id,
            prisonNumber: person.prisonNumber,
          }),
        },
        organisation,
        pageHeading: 'Make a referral',
        pageTitleOverride: 'Start referral',
      })
    })

    describe('when there is no PNI find data in the session', () => {
      it('redirects to the PNI find search action', async () => {
        delete request.session.pniFindAndReferData

        const requestHandler = controller.start()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(findPaths.pniFind.personSearch({}))
      })
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
        undefined,
      )
    })

    describe('when there is hspReferralData in the session', () => {
      it('asks the service to create a referral with the hspReferralData from the session', async () => {
        const hspReferralData = {
          eligibilityOverrideReason: 'A valid reason',
          selectedOffences: ['ABC-123'],
        }
        request.body.courseOfferingId = draftReferral.offeringId
        request.body.prisonNumber = draftReferral.prisonNumber
        request.session.hspReferralData = {
          ...hspReferralData,
          totalScore: 1,
        }

        courseService.getOffering.mockResolvedValue(referableCourseOffering)

        TypeUtils.assertHasUser(request)

        referralService.createReferral.mockResolvedValue(referralFactory.started().build({ id: referralId }))

        const requestHandler = controller.create()
        await requestHandler(request, response, next)

        expect(referralService.createReferral).toHaveBeenCalledWith(
          username,
          draftReferral.offeringId,
          draftReferral.prisonNumber,
          hspReferralData,
        )
      })
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

        expect(request.session.transferErrorData).toBeUndefined()
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
    const organisation: Organisation = { code: referableCourseOffering.organisationId, prisonName: 'HMP Test' }

    beforeEach(() => {
      request.params.referralId = referralId
      request.session.returnTo = 'check-answers'
    })

    it('renders the referral task list page', async () => {
      organisationService.getOrganisationFromAcp.mockResolvedValue(organisation)

      personService.getPerson.mockResolvedValue(person)
      referralService.getReferral.mockResolvedValue(draftReferral)

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      const coursePresenter = createMock<CoursePresenter>({ name: course.name })
        ; (CourseUtils.presentCourse as jest.Mock).mockReturnValue(coursePresenter)

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
        pageTitleOverride: 'Referral tasks to complete',
        person,
        taskListSections: NewReferralUtils.taskListSections(draftReferral),
      })
    })

    describe('when the referral has been requested with an `updatePerson` query', () => {
      it('calls `referralService.getReferral` with the same value', async () => {
        organisationService.getOrganisationFromAcp.mockResolvedValue(organisation)

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
      personService.getPerson.mockResolvedValue(person)

      referralService.getReferral.mockResolvedValue(draftReferral)
      request.params.referralId = referralId

      const requestHandler = controller.showPerson()
      await requestHandler(request, response, next)

      expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
      expect(personService.getPerson).toHaveBeenCalledWith(username, draftReferral.prisonNumber)
      expect(response.render).toHaveBeenCalledWith('referrals/new/showPerson', {
        pageHeading: "Del Hatton's details",
        pageTitleOverride: 'Personal details',
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
    const referrerName = faker.person.fullName()
    const referrerEmail = faker.internet.email()
    const coursePresenter = createMock<CoursePresenter>({
      audience: audienceFactory.build().name,
    })
    const organisation: Organisation = { code: referableCourseOffering.organisationId, prisonName: 'HMP Test' }
    const participationsForReferral = courseParticipationFactory.buildList(2, { isDraft: true })
    const summaryListOptions: Array<GovukFrontendSummaryListWithRowsWithKeysAndValues> = [
      {
        card: { title: { text: 'Participation 1' } },
        rows: [{ key: { text: 'Setting' }, value: { text: 'Community' } }],
      },
      {
        card: { title: { text: 'Participation 1' } },
        rows: [{ key: { text: 'Setting' }, value: { text: 'Community' } }],
      },
    ]

    const options = {
      card: { title: { text: 'Participation 1' } },
      rows: [{ key: { text: 'Setting' }, value: { text: 'Community' } }],
    }

    const sexualOffenceDetails = [
      sexualOffenceDetailsFactory.build({ categoryCode: 'AGAINST_MINORS', description: 'offence 1', score: 1 }),
      sexualOffenceDetailsFactory.build({
        categoryCode: 'INCLUDES_VIOLENCE_FORCE_HUMILIATION',
        description: 'offence 2',
        score: 2,
      }),
      sexualOffenceDetailsFactory.build({ categoryCode: 'OTHER', description: 'offence 3', score: 3 }),
    ]
    const hspReferralDetails = hspReferralDetailsFactory.build({ selectedOffences: sexualOffenceDetails })

    beforeEach(() => {
      personService.getPerson.mockResolvedValue(person)
      userService.getFullNameFromUsername.mockResolvedValue(referrerName)
      userService.getEmailFromUsername.mockResolvedValue(referrerEmail)

      request.params.referralId = referralId
      referralService.getReferral.mockResolvedValue(submittableReferral)
      mockNewReferralUtils.isReadyForSubmission.mockReturnValue(true)
      mockNewReferralUtils.courseOfferingSummaryListRows.mockReturnValue(courseOfferingSummaryListRows)
      mockNewReferralUtils.referrerSummaryListRows.mockReturnValue(referrerSummaryListRows)
      mockCourseUtils.isHsp.mockReturnValue(false)

      TypeUtils.assertHasUser(request)

      organisationService.getOrganisationFromAcp.mockResolvedValue(organisation)

      courseService.getCourse.mockResolvedValue(course)
        ; (CourseUtils.presentCourse as jest.Mock).mockReturnValue(coursePresenter)

      courseService.getParticipationsByReferral.mockResolvedValue(participationsForReferral)

      referralService.getHspReferralDetails.mockResolvedValue(hspReferralDetails)

      courseService.presentCourseParticipation.mockResolvedValue(options)

      const emptyErrorsLocal = { list: [], messages: {} }
        ; (FormUtils.setFieldErrors as jest.Mock).mockImplementation((_request, _response, _fields) => {
          response.locals.errors = emptyErrorsLocal
        })
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    describe('Successfully checking answers', () => {
      const defaultRenderData = {
        additionalInformation: submittableReferral.additionalInformation,
        courseOfferingSummaryListRows,
        pageHeading: 'Check your answers',
        participationSummaryListsOptions: summaryListOptions,
        person,
        personSummaryListRows: PersonUtils.summaryListRows(person),
        referralId,
        referrerSummaryListRows,
        successMessage: undefined,
        referrerOverrideReason: undefined,
      }

      beforeAll(() => {
        ; (request.flash as jest.Mock).mockImplementation(() => [])

        return () => {
          ; (request.flash as jest.Mock).mockReset()
        }
      })

      afterEach(() => {
        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
        expect(personService.getPerson).toHaveBeenCalledWith(username, submittableReferral.prisonNumber)
        expect(userService.getFullNameFromUsername).toHaveBeenCalledWith(userToken, submittableReferral.referrerUsername)
        expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['confirmation'])
        expect(courseService.getParticipationsByReferral).toHaveBeenCalledWith(username, referralId)
        expect(courseService.presentCourseParticipation).toHaveBeenCalledTimes(2)
        expect(request.session.returnTo).toBe('check-answers')

        response.render.mockClear()
      })

      it('passes the message to the template', async () => {
        const successMessage = 'A success message'
          ; (request.flash as jest.Mock).mockImplementation(() => [successMessage])

        const requestHandler = controller.checkAnswers()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'referrals/new/checkAnswers',
          expect.objectContaining({
            successMessage,
          }),
        )
      })

      it(`Renders a non-HSP referral`, async () => {
        // Given 
        mockCourseUtils.isHsp.mockReturnValue(false)

        // When
        const requestHandler = controller.checkAnswers()
        await requestHandler(request, response, next)

        // Then
        const [pathway, data] = response.render.mock.calls[0]
        expect(pathway).toBe('referrals/new/checkAnswers')
        expect(data).toStrictEqual({
          isHsp: false,
          offenceAgainstMinorsSummaryListRows: undefined,
          offenceOtherSummaryListRows: undefined,
          offenceViolenceForceSummaryListRows: undefined,
          ...defaultRenderData,
        })
      });

      it(`Reacts accordingly when the Referral is for a Healthy Sex Programme (HSP)`, async () => {
        // Given
        mockCourseUtils.isHsp.mockReturnValue(true)

        // When
        const requestHandler = controller.checkAnswers()
        await requestHandler(request, response, next)

        // Then
        const [pathway, data] = response.render.mock.calls[0]
        expect(pathway).toBe('referrals/new/checkAnswers')
        expect(data).toStrictEqual({
          isHsp: true,
          offenceAgainstMinorsSummaryListRows: SexualOffenceDetailsUtils.offenceSummaryListRows(
            sexualOffenceDetails.filter(detail => detail.categoryCode === 'AGAINST_MINORS'),
          ),
          offenceOtherSummaryListRows: SexualOffenceDetailsUtils.offenceSummaryListRows(
            sexualOffenceDetails.filter(detail => detail.categoryCode === 'OTHER'),
          ),
          offenceViolenceForceSummaryListRows: SexualOffenceDetailsUtils.offenceSummaryListRows(
            sexualOffenceDetails.filter(detail => detail.categoryCode === 'INCLUDES_VIOLENCE_FORCE_HUMILIATION'),
          ),
          ...defaultRenderData
        })
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
        mockNewReferralUtils.isReadyForSubmission.mockReturnValue(false)

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

      mockNewReferralUtils.isReadyForSubmission.mockReturnValue(true)
    })

    it('asks the service to update the referral status to submitted and redirects to the complete action', async () => {
      referralService.getReferral.mockResolvedValue(submittableReferral)
      request.body.confirmation = 'true'

      request.params.referralId = referralId

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
        mockNewReferralUtils.isReadyForSubmission.mockReturnValue(false)

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.new.show({ referralId }))
      })
    })

    describe('when there is a duplicate referral', () => {
      it('redirects to the show duplicate action', async () => {
        const duplicateReferral = referralFactory.started().build({ id: referralId })
        const error = createError(409, 'Duplicate referral', { response: { body: duplicateReferral, status: 409 } })
        const sanitisedError = sanitiseError(error)

        referralService.submitReferral.mockRejectedValue(sanitisedError)

        request.body.confirmation = 'true'
        request.params.referralId = referralId
        referralService.getReferral.mockResolvedValue(submittableReferral)

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(request.session.transferErrorData).toBeUndefined()
        expect(response.redirect).toHaveBeenCalledWith(referPaths.show.duplicate({ referralId: duplicateReferral.id }))
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
          pageTitleOverride: 'Referral complete',
        })
      })
    })

    describe('when the referral status is `referral_started`', () => {
      it('responds with a 400', async () => {
        request.params.referralId = referralId
        referralService.getReferral.mockResolvedValue(draftReferral)

        const requestHandler = controller.complete()
        const expectedError = createError(400, 'Referral has not been submitted.')

        expect(() => requestHandler(request, response, next)).rejects.toThrowError(expectedError)
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
