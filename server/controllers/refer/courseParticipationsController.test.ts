import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { when } from 'jest-when'

import CourseParticipationsController from './courseParticipationsController'
import { referPaths } from '../../paths'
import type { CourseService, PersonService, ReferralService } from '../../services'
import {
  courseFactory,
  courseParticipationFactory,
  personFactory,
  referralFactory,
  userFactory,
} from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import { CourseParticipationUtils, CourseUtils, FormUtils, StringUtils } from '../../utils'
import type { CourseParticipation } from '@accredited-programmes/models'
import type { CourseParticipationPresenter } from '@accredited-programmes/ui'

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

    describe('when the `courseName` is a non-empty string and not "Other"', () => {
      it('asks the service to create a course participation and redirects to the details action', async () => {
        const courseParticipation = courseParticipationFactory.build()
        const { courseName } = courseParticipation

        request.body = { courseName }
        courseService.createParticipation.mockResolvedValue(courseParticipation)
        ;(CourseParticipationUtils.processCourseFormData as jest.Mock).mockImplementation(
          (_courseName, _otherCourseName, _request) => {
            return { courseName, hasFormErrors: false }
          },
        )

        const requestHandler = courseParticipationsController.create()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(token, request.params.referralId)
        expect(CourseParticipationUtils.processCourseFormData).toHaveBeenCalledWith(
          request.body.courseName,
          request.body.otherCourseName,
          request,
        )
        expect(courseService.createParticipation).toHaveBeenCalledWith(token, referral.prisonNumber, courseName)
        expect(request.flash).toHaveBeenCalledWith('successMessage', 'You have successfully added a programme.')
        expect(response.redirect).toHaveBeenCalledWith(
          referPaths.programmeHistory.details.show({
            courseParticipationId: courseParticipation.id,
            referralId: referral.id,
          }),
        )
      })
    })

    describe('when the `courseName` is "Other" and `otherCourseName` is a non-empty string when trimmed', () => {
      it('asks the service to create a course participation and redirects to the details action', async () => {
        const otherCourseName = 'A course not in our system'
        const courseParticipation = courseParticipationFactory.build({ courseName: otherCourseName })

        request.body = { courseName: 'Other', otherCourseName }
        courseService.createParticipation.mockResolvedValue(courseParticipation)
        ;(CourseParticipationUtils.processCourseFormData as jest.Mock).mockImplementation(
          (_courseName, _otherCourseName, _request) => {
            return { courseName: otherCourseName, hasFormErrors: false }
          },
        )

        const requestHandler = courseParticipationsController.create()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(token, request.params.referralId)
        expect(CourseParticipationUtils.processCourseFormData).toHaveBeenCalledWith(
          request.body.courseName,
          request.body.otherCourseName,
          request,
        )
        expect(courseService.createParticipation).toHaveBeenCalledWith(token, referral.prisonNumber, otherCourseName)
        expect(request.flash).toHaveBeenCalledWith('successMessage', 'You have successfully added a programme.')
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
        request.body = { courseName: 'something', otherCourseName: 'something else' }
        ;(CourseParticipationUtils.processCourseFormData as jest.Mock).mockImplementation(
          (_courseName, _otherCourseName, _request) => {
            return { hasFormErrors: true }
          },
        )

        const requestHandler = courseParticipationsController.create()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(token, request.params.referralId)
        expect(CourseParticipationUtils.processCourseFormData).toHaveBeenCalledWith(
          request.body.courseName,
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
      const addedByUser = userFactory.build()
      const person = personFactory.build()
      const referral = referralFactory.build({ prisonNumber: person.prisonNumber })
      const course = courseFactory.build()
      const courseParticipation = courseParticipationFactory.build({
        addedBy: addedByUser.username,
        courseName: course.name,
        prisonNumber: person.prisonNumber,
      })
      const courseParticipationPresenter: CourseParticipationPresenter = {
        ...courseParticipation,
        addedByDisplayName: StringUtils.convertToTitleCase(addedByUser.name),
      }
      const courseParticipationId = courseParticipation.id
      const referralId = referral.id

      request.params.courseParticipationId = courseParticipationId
      request.params.referralId = referralId

      personService.getPerson.mockResolvedValue(person)
      referralService.getReferral.mockResolvedValue(referral)
      courseService.getCourse.mockResolvedValue(course)
      courseService.getParticipation.mockResolvedValue(courseParticipation)
      courseService.presentCourseParticipation.mockResolvedValue(courseParticipationPresenter)

      const requestHandler = courseParticipationsController.delete()
      await requestHandler(request, response, next)

      expect(CourseParticipationUtils.summaryListOptions).toHaveBeenCalledWith(
        courseParticipationPresenter,
        referral.id,
        {
          change: false,
          remove: false,
        },
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
    const courseParticipationWithKnownCoursename = courseParticipationFactory.build({
      courseName: courses[0].name,
      prisonNumber: person.prisonNumber,
    })
    const courseParticipationWithUnknownCourseName = courseParticipationFactory.build({
      courseName: 'A course not in our system',
      prisonNumber: person.prisonNumber,
    })
    const referral = referralFactory.started().build({ prisonNumber: person.prisonNumber })

    describe.each([
      ['a known', courseParticipationWithKnownCoursename],
      ['an unknown', courseParticipationWithUnknownCourseName],
    ])(
      'when the participation has %s `courseName`',
      (courseNameType: string, courseParticipation: CourseParticipation) => {
        it('renders the edit template for selecting a course', async () => {
          request.params = { courseParticipationId: courseParticipation.id, referralId: referral.id }
          courseService.getParticipation.mockResolvedValue(courseParticipation)
          referralService.getReferral.mockResolvedValue(referral)
          personService.getPerson.mockResolvedValue(person)
          courseService.getCourses.mockResolvedValue(courses)
          ;(FormUtils.setFieldErrors as jest.Mock).mockImplementation((_request, _response, _fields) => {
            response.locals.errors = { list: [], messages: {} }
          })

          const requestHandler = courseParticipationsController.editCourse()
          await requestHandler(request, response, next)

          const { courseName } = courseParticipation
          const isKnownCourse = courseNameType === 'a known'

          expect(response.render).toHaveBeenCalledWith('referrals/courseParticipations/course', {
            action: `${referPaths.programmeHistory.updateProgramme({
              courseParticipationId: courseParticipation.id,
              referralId: referral.id,
            })}?_method=PUT`,
            courseRadioOptions: CourseUtils.courseRadioOptions(courses),
            formValues: isKnownCourse ? { courseName } : { courseName: 'Other', otherCourseName: courseName },
            otherCourseNameChecked: !isKnownCourse,
            pageHeading: 'Add Accredited Programme history',
            person,
            referralId: referral.id,
          })
          expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['courseName', 'otherCourseName'])
        })
      },
    )
  })

  describe('index', () => {
    const addedByUser = userFactory.build()
    const referral = referralFactory.build()
    const person = personFactory.build()
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
    const latestCourseParticipationPresenter: CourseParticipationPresenter = {
      ...latestCourseParticipation,
      addedByDisplayName: StringUtils.convertToTitleCase(addedByUser.name),
    }
    const course = courseFactory.build()

    beforeEach(() => {
      referralService.getReferral.mockResolvedValue(referral)
      personService.getPerson.mockResolvedValue(person)
      courseService.getParticipationsByPerson.mockResolvedValue([
        latestCourseParticipation,
        earliestCourseParticipation,
      ])
      when(courseService.presentCourseParticipation)
        .calledWith(token, latestCourseParticipation)
        .mockResolvedValue(latestCourseParticipationPresenter)
      when(courseService.presentCourseParticipation)
        .calledWith(token, earliestCourseParticipation)
        .mockResolvedValue(earliestCourseParticipationPresenter)
      courseService.getCourse.mockResolvedValue(course)
      ;(request.flash as jest.Mock).mockImplementation(() => [])
    })

    it("renders the index template for a person's programme history", async () => {
      const requestHandler = courseParticipationsController.index()
      await requestHandler(request, response, next)

      expect(CourseParticipationUtils.summaryListOptions).toHaveBeenNthCalledWith(
        1,
        earliestCourseParticipationPresenter,
        referral.id,
      )
      expect(CourseParticipationUtils.summaryListOptions).toHaveBeenNthCalledWith(
        2,
        latestCourseParticipationPresenter,
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
      expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['courseName', 'otherCourseName'])
    })
  })

  describe('updateCourse', () => {
    const referral = referralFactory.build()

    beforeEach(() => {
      referralService.getReferral.mockResolvedValue(referral)
      request.params.referralId = referral.id
    })

    describe.each([
      ['when the `courseName` is a non-empty string and not "Other"', false],
      ['when the `courseName` is "Other" and `otherCourseName` is a non-empty string when trimmed', true],
    ])('%s', (_description: string, isOtherCourse: boolean) => {
      it('asks the service to update the course data and redirects to the details action', async () => {
        const courseParticipation = courseParticipationFactory.build()
        request.params.courseParticipationId = courseParticipation.id
        courseService.getParticipation.mockResolvedValue(courseParticipation)

        const courseName = 'A NEW VALUE'

        if (isOtherCourse) {
          request.body = { courseName: 'other', otherCourseName: courseName }
        } else {
          request.body = { courseName }
        }
        ;(CourseParticipationUtils.processCourseFormData as jest.Mock).mockImplementation(
          (_courseName, _otherCourseName, _request) => {
            return { courseName, hasFormErrors: false }
          },
        )

        const { detail, setting, source, outcome } = courseParticipation
        const courseParticipationUpdate = {
          courseName,
          detail,
          outcome,
          setting,
          source,
        }
        courseService.updateParticipation.mockResolvedValue({ ...courseParticipation, ...courseParticipationUpdate })

        const requestHandler = courseParticipationsController.updateCourse()
        await requestHandler(request, response, next)

        expect(courseService.getParticipation).toHaveBeenCalledWith(token, request.params.courseParticipationId)
        expect(CourseParticipationUtils.processCourseFormData).toHaveBeenCalledWith(
          request.body.courseName,
          request.body.otherCourseName,
          request,
        )
        expect(courseService.updateParticipation).toHaveBeenCalledWith(
          token,
          courseParticipation.id,
          courseParticipationUpdate,
        )
        expect(request.flash).toHaveBeenCalledWith('successMessage', 'You have successfully updated a programme.')
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

        request.body = { courseName: 'something', otherCourseName: 'something else' }
        ;(CourseParticipationUtils.processCourseFormData as jest.Mock).mockImplementation(
          (_courseName, _otherCourseName, _request) => {
            return { hasFormErrors: true }
          },
        )

        const requestHandler = courseParticipationsController.updateCourse()
        await requestHandler(request, response, next)

        expect(courseService.getParticipation).toHaveBeenCalledWith(token, request.params.courseParticipationId)
        expect(CourseParticipationUtils.processCourseFormData).toHaveBeenCalledWith(
          request.body.courseName,
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
