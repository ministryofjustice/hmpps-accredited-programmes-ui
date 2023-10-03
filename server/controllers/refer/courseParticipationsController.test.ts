import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'

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

  beforeEach(() => {
    request = createMock<Request>({ user: { token } })
    response = Helpers.createMockResponseWithCaseloads()
    courseParticipationsController = new CourseParticipationsController(courseService, personService, referralService)
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

    describe('when the `courseId` is a string with length', () => {
      it('asks the service to create a course participation and redirects to the details action', async () => {
        const courseParticipation = courseParticipationFactory.withCourseId().build()
        const { courseId } = courseParticipation

        request.body = { courseId }
        courseService.createParticipation.mockResolvedValue(courseParticipation)
        ;(CourseParticipationUtils.processedCourseFormData as jest.Mock).mockImplementation(
          (_courseId, _otherCourseName, _request) => {
            return { courseId, hasFormErrors: false }
          },
        )

        const requestHandler = courseParticipationsController.create()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(token, request.params.referralId)
        expect(CourseParticipationUtils.processedCourseFormData).toHaveBeenCalledWith(
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
          referPaths.programmeHistory.details({
            courseParticipationId: courseParticipation.id,
            referralId: referral.id,
          }),
        )
      })
    })

    describe('when the `courseId` value is `other` and `otherCourseName` is a string with length when trimmed', () => {
      it('asks the service to create a course participation and redirects to the details action', async () => {
        const courseParticipation = courseParticipationFactory.withOtherCourseName().build()
        const { otherCourseName } = courseParticipation

        request.body = { courseId: 'other', otherCourseName }
        courseService.createParticipation.mockResolvedValue(courseParticipation)
        ;(CourseParticipationUtils.processedCourseFormData as jest.Mock).mockImplementation(
          (_courseId, _otherCourseName, _request) => {
            return { hasFormErrors: false, otherCourseName }
          },
        )

        const requestHandler = courseParticipationsController.create()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(token, request.params.referralId)
        expect(CourseParticipationUtils.processedCourseFormData).toHaveBeenCalledWith(
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
          referPaths.programmeHistory.details({
            courseParticipationId: courseParticipation.id,
            referralId: referral.id,
          }),
        )
      })
    })

    describe('when there are form errors', () => {
      it('redirects back to the `new` action', async () => {
        request.body = { courseId: 'something', otherCourseName: 'something else' }
        ;(CourseParticipationUtils.processedCourseFormData as jest.Mock).mockImplementation(
          (_courseId, _otherCourseName, _request) => {
            return { hasFormErrors: true }
          },
        )

        const requestHandler = courseParticipationsController.create()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(token, request.params.referralId)
        expect(CourseParticipationUtils.processedCourseFormData).toHaveBeenCalledWith(
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

          expect(response.render).toHaveBeenCalledWith('referrals/courseParticipations/course', {
            action: `${referPaths.programmeHistory.updateProgramme({
              courseParticipationId: courseParticipation.id,
              referralId: referral.id,
            })}?_method=PUT`,
            courseRadioOptions: CourseUtils.courseRadioOptions(courses),
            otherCourseNameChecked: courseIdentifierType === 'an otherCourseName',
            pageHeading: 'Add Accredited Programme history',
            person,
            referralId: referral.id,
            values: {
              courseId: courseIdentifierType === 'a courseId' ? courses[0].id : undefined,
              otherCourseName:
                courseIdentifierType === 'an otherCourseName' ? courseParticipation.otherCourseName : undefined,
            },
          })
          expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['courseId', 'otherCourseName'])
        })
      },
    )

    describe('when the `courseService.getParticipation` returns `null`', () => {
      it('responds with a 404', async () => {
        request.params.courseParticipationId = courseParticipationWithCourseId.id
        courseService.getParticipation.mockResolvedValue(null)

        const requestHandler = courseParticipationsController.editCourse()
        const expectedError = createError(
          404,
          `Programme history with ID ${courseParticipationWithCourseId.id} not found.`,
        )

        expect(() => requestHandler(request, response, next)).rejects.toThrowError(expectedError)
      })
    })

    describe('when the person service returns `null`', () => {
      it('responds with a 404', async () => {
        request.params.courseParticipationId = courseParticipationWithCourseId.id
        courseService.getParticipation.mockResolvedValue(courseParticipationWithCourseId)
        referralService.getReferral.mockResolvedValue(referral)
        personService.getPerson.mockResolvedValue(null)

        const requestHandler = courseParticipationsController.editCourse()
        const expectedError = createError(404, `Person with prison number ${person.prisonNumber} not found.`)

        expect(() => requestHandler(request, response, next)).rejects.toThrowError(expectedError)
      })
    })
  })

  describe('index', () => {
    const referral = referralFactory.build()

    it("renders the index template for a person's programme history", async () => {
      referralService.getReferral.mockResolvedValue(referral)

      const person = personFactory.build()
      personService.getPerson.mockResolvedValue(person)

      const courseParticipations = [
        courseParticipationFactory.build({ courseId: 'an-ID' }),
        courseParticipationFactory.build({ courseId: undefined, otherCourseName: 'Another course' }),
      ]
      courseService.getParticipationsByPerson.mockResolvedValue(courseParticipations)

      const course = courseFactory.build()
      courseService.getCourse.mockResolvedValue(course)

      const courseParticipationsWithNames = [
        { ...courseParticipations[0], name: course.name },
        { ...courseParticipations[1], name: 'Another course' },
      ]
      const summaryListsOptions = courseParticipationsWithNames.map(CourseParticipationUtils.summaryListOptions)

      const requestHandler = courseParticipationsController.index()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/courseParticipations/index', {
        pageHeading: 'Accredited Programme history',
        person,
        referralId: referral.id,
        summaryListsOptions,
      })
    })

    describe('when the person service returns `null`', () => {
      it('responds with a 404', async () => {
        referralService.getReferral.mockResolvedValue(referral)
        personService.getPerson.mockResolvedValue(null)

        const requestHandler = courseParticipationsController.index()
        const expectedError = createError(404)

        expect(() => requestHandler(request, response, next)).rejects.toThrowError(expectedError)
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
        otherCourseNameChecked: false,
        pageHeading: 'Add Accredited Programme history',
        person,
        referralId: referral.id,
        values: {},
      })
      expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['courseId', 'otherCourseName'])
    })

    describe('when the person service returns `null`', () => {
      it('responds with a 404', async () => {
        const person = personFactory.build()
        personService.getPerson.mockResolvedValue(null)

        const referral = referralFactory.started().build({ prisonNumber: person.prisonNumber })
        referralService.getReferral.mockResolvedValue(referral)

        const requestHandler = courseParticipationsController.new()
        const expectedError = createError(404, `Person with prison number ${referral.prisonNumber} not found.`)

        expect(() => requestHandler(request, response, next)).rejects.toThrowError(expectedError)
      })
    })
  })

  describe('updateCourse', () => {
    const referral = referralFactory.build()

    beforeEach(() => {
      referralService.getReferral.mockResolvedValue(referral)
      request.params.referralId = referral.id
    })

    describe.each<[string, string]>([
      ['when the `courseId` is a string with length', `courseId`],
      [
        'when the `courseId` value is `other` and `otherCourseName` is a string with length when trimmed',
        'otherCourseName',
      ],
    ])('%s', (_description: string, truthyField: string) => {
      it('asks the service to update the course data and redirects to the details action', async () => {
        const courseParticipation = courseParticipationFactory.build()
        request.params.courseParticipationId = courseParticipation.id
        courseService.getParticipation.mockResolvedValue(courseParticipation)

        const newValue = 'A NEW VALUE'
        request.body = { [truthyField]: newValue }
        ;(CourseParticipationUtils.processedCourseFormData as jest.Mock).mockImplementation(
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
        expect(CourseParticipationUtils.processedCourseFormData).toHaveBeenCalledWith(
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
          referPaths.programmeHistory.details({
            courseParticipationId: courseParticipation.id,
            referralId: referral.id,
          }),
        )
      })
    })

    describe('when the `courseService.getParticipation` returns `null`', () => {
      it('responds with a 404', async () => {
        request.params.courseParticipationId = 'NON-EXISTENT'
        courseService.getParticipation.mockResolvedValue(null)

        const requestHandler = courseParticipationsController.updateCourse()
        const expectedError = createError(
          404,
          `Programme history with ID ${request.params.courseParticipationId} not found.`,
        )

        expect(() => requestHandler(request, response, next)).rejects.toThrowError(expectedError)
      })
    })

    describe('when there are form errors', () => {
      it('redirects back to the `editCourse` action', async () => {
        const courseParticipation = courseParticipationFactory.build()
        request.params.courseParticipationId = courseParticipation.id
        courseService.getParticipation.mockResolvedValue(courseParticipation)

        request.body = { courseId: 'something', otherCourseName: 'something else' }
        ;(CourseParticipationUtils.processedCourseFormData as jest.Mock).mockImplementation(
          (_courseId, _otherCourseName, _request) => {
            return { hasFormErrors: true }
          },
        )

        const requestHandler = courseParticipationsController.updateCourse()
        await requestHandler(request, response, next)

        expect(courseService.getParticipation).toHaveBeenCalledWith(token, request.params.courseParticipationId)
        expect(CourseParticipationUtils.processedCourseFormData).toHaveBeenCalledWith(
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
})
