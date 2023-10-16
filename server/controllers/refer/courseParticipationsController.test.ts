import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import CourseParticipationsController from './courseParticipationsController'
import { referPaths } from '../../paths'
import type { CourseService, PersonService, ReferralService } from '../../services'
import { courseFactory, courseParticipationFactory, personFactory, referralFactory } from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import { CourseParticipationUtils, CourseUtils, FormUtils } from '../../utils'
import type { CourseParticipation } from '@accredited-programmes/models'

jest.mock('../../utils/formUtils')
jest.mock('../../utils/courseParticipationUtils')

describe('CourseParticipationsController', () => {
  const token = 'SOME_TOKEN'
  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const courseService = createMock<CourseService>({})
  const personService = createMock<PersonService>({})
  const referralService = createMock<ReferralService>({})

  let courseParticipationsController: CourseParticipationsController

  const summaryListOptions = 'summary list options'

  beforeEach(() => {
    request = createMock<Request>({ user: { token } })
    response = Helpers.createMockResponseWithCaseloads()
    courseParticipationsController = new CourseParticipationsController(courseService, personService, referralService)
    ;(CourseParticipationUtils.summaryListOptions as jest.Mock).mockImplementation(
      (_courseParticipationWithName, _referralId, _withActions = { change: true, remove: true }) => {
        return summaryListOptions
      },
    )
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('create', () => {
    const referral = referralFactory.build()

    beforeEach(() => {
      referralService.getReferral.mockResolvedValue(referral)
      request.params.referralId = referral.id
    })

    describe('when the `courseId` is a non-empty string', () => {
      it('asks the service to create a course participation and redirects to the details action', async () => {
        const courseParticipation = courseParticipationFactory.withCourseId().build()
        const { courseId } = courseParticipation

        request.body = { courseId }
        courseService.createParticipation.mockResolvedValue(courseParticipation)
        ;(CourseParticipationUtils.processCourseFormData as jest.Mock).mockImplementation(
          (_courseId, _otherCourseName, _request) => {
            return { courseId, hasFormErrors: false }
          },
        )

        const requestHandler = courseParticipationsController.create()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(token, request.params.referralId)
        expect(CourseParticipationUtils.processCourseFormData).toHaveBeenCalledWith(
          request.body.courseId,
          request.body.otherCourseName,
          request,
        )
        expect(courseService.createParticipation).toHaveBeenCalledWith(
          token,
          referral.prisonNumber,
          courseId,
          undefined,
        )
        expect(response.redirect).toHaveBeenCalledWith(
          referPaths.programmeHistory.details.show({
            courseParticipationId: courseParticipation.id,
            referralId: referral.id,
          }),
        )
      })
    })

    describe('when the `courseId` is `other` and `otherCourseName` is a non-empty string when trimmed', () => {
      it('asks the service to create a course participation and redirects to the details action', async () => {
        const courseParticipation = courseParticipationFactory.withOtherCourseName().build()
        const { otherCourseName } = courseParticipation

        request.body = { courseId: 'other', otherCourseName }
        courseService.createParticipation.mockResolvedValue(courseParticipation)
        ;(CourseParticipationUtils.processCourseFormData as jest.Mock).mockImplementation(
          (_courseId, _otherCourseName, _request) => {
            return { hasFormErrors: false, otherCourseName }
          },
        )

        const requestHandler = courseParticipationsController.create()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(token, request.params.referralId)
        expect(CourseParticipationUtils.processCourseFormData).toHaveBeenCalledWith(
          request.body.courseId,
          request.body.otherCourseName,
          request,
        )
        expect(courseService.createParticipation).toHaveBeenCalledWith(
          token,
          referral.prisonNumber,
          undefined,
          otherCourseName,
        )
        expect(response.redirect).toHaveBeenCalledWith(
          referPaths.programmeHistory.details.show({
            courseParticipationId: courseParticipation.id,
            referralId: referral.id,
          }),
        )
      })
    })

    describe('when there are form errors', () => {
      it('redirects back to the `new` action', async () => {
        request.body = { courseId: 'something', otherCourseName: 'something else' }
        ;(CourseParticipationUtils.processCourseFormData as jest.Mock).mockImplementation(
          (_courseId, _otherCourseName, _request) => {
            return { hasFormErrors: true }
          },
        )

        const requestHandler = courseParticipationsController.create()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(token, request.params.referralId)
        expect(CourseParticipationUtils.processCourseFormData).toHaveBeenCalledWith(
          request.body.courseId,
          request.body.otherCourseName,
          request,
        )
        expect(response.redirect).toHaveBeenCalledWith(
          referPaths.programmeHistory.new({ referralId: request.params.referralId }),
        )
      })
    })
  })

  describe('delete', () => {
    it('renders the delete template for a specific course participation', async () => {
      const person = personFactory.build()
      const referral = referralFactory.build({ prisonNumber: person.prisonNumber })
      const course = courseFactory.build()
      const courseParticipation = courseParticipationFactory.withCourseId().build({
        courseId: course.id,
        prisonNumber: person.prisonNumber,
      })
      const courseParticipationId = courseParticipation.id
      const referralId = referral.id

      request.params.courseParticipationId = courseParticipationId
      request.params.referralId = referralId

      personService.getPerson.mockResolvedValue(person)
      referralService.getReferral.mockResolvedValue(referral)
      courseService.getCourse.mockResolvedValue(course)
      courseService.getParticipation.mockResolvedValue(courseParticipation)

      const courseParticipationWithName = { ...courseParticipation, name: course.name }

      const requestHandler = courseParticipationsController.delete()
      await requestHandler(request, response, next)

      expect(CourseParticipationUtils.summaryListOptions).toHaveBeenCalledWith(
        courseParticipationWithName,
        referral.id,
        { change: false, remove: false },
      )
      expect(response.render).toHaveBeenCalledWith('referrals/courseParticipations/delete', {
        action: `${referPaths.programmeHistory.destroy({ courseParticipationId, referralId })}?_method=DELETE`,
        pageHeading: 'Remove programme',
        person,
        referralId: referral.id,
        summaryListOptions,
      })
    })
  })

  describe('destroy', () => {
    it('asks the service to delete the participation and redirects to the index action', async () => {
      const courseParticipationId = 'aCourseParticipationId'
      const referralId = 'aReferralId'

      request.params.courseParticipationId = courseParticipationId
      request.params.referralId = referralId

      const requestHandler = courseParticipationsController.destroy()
      await requestHandler(request, response, next)

      expect(courseService.deleteParticipation).toHaveBeenCalledWith(token, courseParticipationId)
      expect(request.flash).toHaveBeenCalledWith('successMessage', 'You have successfully removed a programme.')
      expect(response.redirect).toHaveBeenCalledWith(referPaths.programmeHistory.index({ referralId }))
    })
  })

  describe('editCourse', () => {
    const courses = courseFactory.buildList(2)
    const person = personFactory.build()
    const courseParticipationWithCourseId = courseParticipationFactory.withCourseId().build({
      courseId: courses[0].id,
      prisonNumber: person.prisonNumber,
    })
    const courseParticipationWithOtherCourseName = courseParticipationFactory.withOtherCourseName().build({
      prisonNumber: person.prisonNumber,
    })
    const referral = referralFactory.started().build({ prisonNumber: person.prisonNumber })

    beforeEach(() => {
      request.params.referralId = referral.id
    })

    type CourseIdentifierType = 'a courseId' | 'an otherCourseName'

    describe.each<[CourseIdentifierType, CourseParticipation]>([
      ['a courseId', courseParticipationWithCourseId],
      ['an otherCourseName', courseParticipationWithOtherCourseName],
    ])(
      'when the participation has `%s`',
      (courseIdentifierType: CourseIdentifierType, courseParticipation: CourseParticipation) => {
        it('renders the edit template for selecting a course', async () => {
          request.params.courseParticipationId = courseParticipation.id
          courseService.getParticipation.mockResolvedValue(courseParticipation)
          referralService.getReferral.mockResolvedValue(referral)
          personService.getPerson.mockResolvedValue(person)
          courseService.getCourses.mockResolvedValue(courses)

          const emptyErrorsLocal = { list: [], messages: {} }
          ;(FormUtils.setFieldErrors as jest.Mock).mockImplementation((_request, _response, _fields) => {
            response.locals.errors = emptyErrorsLocal
          })

          const requestHandler = courseParticipationsController.editCourse()
          await requestHandler(request, response, next)

          const { courseId, otherCourseName } = courseParticipation

          expect(response.render).toHaveBeenCalledWith('referrals/courseParticipations/course', {
            action: `${referPaths.programmeHistory.updateProgramme({
              courseParticipationId: courseParticipation.id,
              referralId: referral.id,
            })}?_method=PUT`,
            courseRadioOptions: CourseUtils.courseRadioOptions(courses),
            formValues: { courseId, otherCourseName },
            otherCourseNameChecked: courseIdentifierType === 'an otherCourseName',
            pageHeading: 'Add Accredited Programme history',
            person,
            referralId: referral.id,
          })
          expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['courseId', 'otherCourseName'])
        })
      },
    )
  })

  describe('index', () => {
    const referral = referralFactory.build()
    const person = personFactory.build()
    const courseParticipations = [
      courseParticipationFactory.build({ courseId: 'an-ID', createdAt: '2023-01-01T12:00:00.000Z' }),
      courseParticipationFactory.build({
        courseId: undefined,
        createdAt: '2022-01-01T12:00:00.000Z',
        otherCourseName: 'Another course',
      }),
    ]
    const course = courseFactory.build()
    const courseParticipationsWithNames = [
      { ...courseParticipations[0], name: course.name },
      { ...courseParticipations[1], name: 'Another course' },
    ]

    beforeEach(() => {
      referralService.getReferral.mockResolvedValue(referral)
      personService.getPerson.mockResolvedValue(person)
      courseService.getParticipationsByPerson.mockResolvedValue(courseParticipations)
      courseService.getCourse.mockResolvedValue(course)
      ;(request.flash as jest.Mock).mockImplementation(() => [])
    })

    it("renders the index template for a person's programme history", async () => {
      const requestHandler = courseParticipationsController.index()
      await requestHandler(request, response, next)

      expect(CourseParticipationUtils.summaryListOptions).toHaveBeenNthCalledWith(
        1,
        courseParticipationsWithNames[1],
        referral.id,
      )
      expect(CourseParticipationUtils.summaryListOptions).toHaveBeenNthCalledWith(
        2,
        courseParticipationsWithNames[0],
        referral.id,
      )
      expect(response.render).toHaveBeenCalledWith('referrals/courseParticipations/index', {
        action: `${referPaths.programmeHistory.updateReviewedStatus({ referralId: referral.id })}?_method=PUT`,
        pageHeading: 'Accredited Programme history',
        person,
        referralId: referral.id,
        successMessage: undefined,
        summaryListsOptions: [summaryListOptions, summaryListOptions],
      })
    })

    describe('when there is a success message', () => {
      it('passes the message to the template', async () => {
        const successMessage = 'A success message'
        ;(request.flash as jest.Mock).mockImplementation(() => [successMessage])

        const requestHandler = courseParticipationsController.index()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'referrals/courseParticipations/index',
          expect.objectContaining({
            successMessage,
          }),
        )
      })
    })
  })

  describe('new', () => {
    it('renders the new template for selecting a course', async () => {
      const courses = courseFactory.buildList(2)
      courseService.getCourses.mockResolvedValue(courses)

      const person = personFactory.build()
      personService.getPerson.mockResolvedValue(person)

      const referral = referralFactory.started().build({ prisonNumber: person.prisonNumber })
      referralService.getReferral.mockResolvedValue(referral)

      const emptyErrorsLocal = { list: [], messages: {} }
      ;(FormUtils.setFieldErrors as jest.Mock).mockImplementation((_request, _response, _fields) => {
        response.locals.errors = emptyErrorsLocal
      })

      const requestHandler = courseParticipationsController.new()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/courseParticipations/course', {
        action: referPaths.programmeHistory.create({ referralId: referral.id }),
        courseRadioOptions: CourseUtils.courseRadioOptions(courses),
        formValues: {},
        otherCourseNameChecked: false,
        pageHeading: 'Add Accredited Programme history',
        person,
        referralId: referral.id,
      })
      expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['courseId', 'otherCourseName'])
    })
  })

  describe('updateCourse', () => {
    const referral = referralFactory.build()

    beforeEach(() => {
      referralService.getReferral.mockResolvedValue(referral)
      request.params.referralId = referral.id
    })

    describe.each<[string, string]>([
      ['when the `courseId` is a non-empty string', `courseId`],
      ['when the `courseId` is `other` and `otherCourseName` is a non-empty string when trimmed', 'otherCourseName'],
    ])('%s', (_description: string, truthyField: string) => {
      it('asks the service to update the course data and redirects to the details action', async () => {
        const courseParticipation = courseParticipationFactory.build()
        request.params.courseParticipationId = courseParticipation.id
        courseService.getParticipation.mockResolvedValue(courseParticipation)

        const newValue = 'A NEW VALUE'
        request.body = { [truthyField]: newValue }
        ;(CourseParticipationUtils.processCourseFormData as jest.Mock).mockImplementation(
          (_courseId, _otherCourseName, _request) => {
            return { hasFormErrors: false, [truthyField]: newValue }
          },
        )

        const undefinedField = truthyField === 'courseId' ? 'otherCourseName' : 'courseId'
        const updatedCourseParticipation = {
          ...courseParticipation,
          [truthyField]: newValue,
          [undefinedField]: undefined,
        }
        courseService.updateParticipation.mockResolvedValue(updatedCourseParticipation)

        const requestHandler = courseParticipationsController.updateCourse()
        await requestHandler(request, response, next)

        expect(courseService.getParticipation).toHaveBeenCalledWith(token, request.params.courseParticipationId)
        expect(CourseParticipationUtils.processCourseFormData).toHaveBeenCalledWith(
          request.body.courseId,
          request.body.otherCourseName,
          request,
        )
        expect(courseService.updateParticipation).toHaveBeenCalledWith(
          token,
          courseParticipation.id,
          updatedCourseParticipation,
        )
        expect(response.redirect).toHaveBeenCalledWith(
          referPaths.programmeHistory.details.show({
            courseParticipationId: courseParticipation.id,
            referralId: referral.id,
          }),
        )
      })
    })

    describe('when there are form errors', () => {
      it('redirects back to the `editCourse` action', async () => {
        const courseParticipation = courseParticipationFactory.build()
        request.params.courseParticipationId = courseParticipation.id
        courseService.getParticipation.mockResolvedValue(courseParticipation)

        request.body = { courseId: 'something', otherCourseName: 'something else' }
        ;(CourseParticipationUtils.processCourseFormData as jest.Mock).mockImplementation(
          (_courseId, _otherCourseName, _request) => {
            return { hasFormErrors: true }
          },
        )

        const requestHandler = courseParticipationsController.updateCourse()
        await requestHandler(request, response, next)

        expect(courseService.getParticipation).toHaveBeenCalledWith(token, request.params.courseParticipationId)
        expect(CourseParticipationUtils.processCourseFormData).toHaveBeenCalledWith(
          request.body.courseId,
          request.body.otherCourseName,
          request,
        )
        expect(response.redirect).toHaveBeenCalledWith(
          referPaths.programmeHistory.editProgramme({
            courseParticipationId: courseParticipation.id,
            referralId: request.params.referralId,
          }),
        )
      })
    })
  })

  describe('updateHasReviewedProgrammeHistory', () => {
    it('asks the service to update the referral and redirects to the index action', async () => {
      const referral = referralFactory.started().build()

      referralService.getReferral.mockResolvedValue(referral)
      request.params.referralId = referral.id

      const hasReviewedProgrammeHistory = true
      request.body = { hasReviewedProgrammeHistory: hasReviewedProgrammeHistory.toString() }

      const requestHandler = courseParticipationsController.updateHasReviewedProgrammeHistory()
      await requestHandler(request, response, next)

      expect(referralService.updateReferral).toHaveBeenCalledWith(token, referral.id, {
        hasReviewedProgrammeHistory,
        oasysConfirmed: referral.oasysConfirmed,
        reason: referral.reason,
      })
      expect(response.redirect).toHaveBeenCalledWith(referPaths.show({ referralId: referral.id }))
    })
  })
})
