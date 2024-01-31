import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import NewReferralsCourseParticipationsController from './courseParticipationsController'
import { referPaths } from '../../../paths'
import type { CourseService, PersonService, ReferralService } from '../../../services'
import {
  courseFactory,
  courseParticipationFactory,
  personFactory,
  referralFactory,
  userFactory,
} from '../../../testutils/factories'
import Helpers from '../../../testutils/helpers'
import { CourseParticipationUtils, CourseUtils, FormUtils } from '../../../utils'
import type { CourseParticipation } from '@accredited-programmes/api'
import type { GovukFrontendSummaryListWithRowsWithKeysAndValues } from '@accredited-programmes/ui'

jest.mock('../../../utils/formUtils')
jest.mock('../../../utils/courseParticipationUtils')

describe('NewReferralsCourseParticipationsController', () => {
  const username = 'SOME_USERNAME'
  const userToken = 'SOME_TOKEN'
  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const courseService = createMock<CourseService>({})
  const personService = createMock<PersonService>({})
  const referralService = createMock<ReferralService>({})

  let controller: NewReferralsCourseParticipationsController

  const summaryListOptions = 'summary list options' as unknown as GovukFrontendSummaryListWithRowsWithKeysAndValues
  const person = personFactory.build()
  const referralId = 'a-referral-id'
  const draftReferral = referralFactory.started().build({ id: referralId, prisonNumber: person.prisonNumber })
  const submittedReferral = referralFactory.submitted().build({ id: referralId, prisonNumber: person.prisonNumber })

  beforeEach(() => {
    request = createMock<Request>({ params: { referralId }, user: { token: userToken, username } })
    response = Helpers.createMockResponseWithCaseloads()

    controller = new NewReferralsCourseParticipationsController(courseService, personService, referralService)
    courseService.presentCourseParticipation.mockResolvedValue(summaryListOptions)
    courseService.getAndPresentParticipationsByPerson.mockResolvedValue([summaryListOptions, summaryListOptions])
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('create', () => {
    describe('when the `courseName` is a non-empty string and not "Other"', () => {
      it('asks the service to create a course participation and redirects to the details action', async () => {
        referralService.getReferral.mockResolvedValue(draftReferral)

        const courseParticipation = courseParticipationFactory.build()
        const { courseName } = courseParticipation

        request.body = { courseName }
        courseService.createParticipation.mockResolvedValue(courseParticipation)
        ;(CourseParticipationUtils.processCourseFormData as jest.Mock).mockImplementation(
          (_courseName, _otherCourseName, _request) => {
            return { courseName, hasFormErrors: false }
          },
        )

        const requestHandler = controller.create()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
        expect(CourseParticipationUtils.processCourseFormData).toHaveBeenCalledWith(
          request.body.courseName,
          request.body.otherCourseName,
          request,
        )
        expect(courseService.createParticipation).toHaveBeenCalledWith(username, draftReferral.prisonNumber, courseName)
        expect(request.flash).toHaveBeenCalledWith('successMessage', 'You have successfully added a programme.')
        expect(response.redirect).toHaveBeenCalledWith(
          referPaths.new.programmeHistory.details.show({
            courseParticipationId: courseParticipation.id,
            referralId,
          }),
        )
      })
    })

    describe('when the `courseName` is "Other" and `otherCourseName` is a non-empty string when trimmed', () => {
      it('asks the service to create a course participation and redirects to the details action', async () => {
        referralService.getReferral.mockResolvedValue(draftReferral)

        const otherCourseName = 'A course not in our system'
        const courseParticipation = courseParticipationFactory.build({ courseName: otherCourseName })

        request.body = { courseName: 'Other', otherCourseName }
        courseService.createParticipation.mockResolvedValue(courseParticipation)
        ;(CourseParticipationUtils.processCourseFormData as jest.Mock).mockImplementation(
          (_courseName, _otherCourseName, _request) => {
            return { courseName: otherCourseName, hasFormErrors: false }
          },
        )

        const requestHandler = controller.create()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
        expect(CourseParticipationUtils.processCourseFormData).toHaveBeenCalledWith(
          request.body.courseName,
          request.body.otherCourseName,
          request,
        )
        expect(courseService.createParticipation).toHaveBeenCalledWith(
          username,
          draftReferral.prisonNumber,
          otherCourseName,
        )
        expect(request.flash).toHaveBeenCalledWith('successMessage', 'You have successfully added a programme.')
        expect(response.redirect).toHaveBeenCalledWith(
          referPaths.new.programmeHistory.details.show({
            courseParticipationId: courseParticipation.id,
            referralId,
          }),
        )
      })
    })

    describe('when the referral has been submitted', () => {
      it('redirects to the referral confirmation action', async () => {
        referralService.getReferral.mockResolvedValue(submittedReferral)

        const requestHandler = controller.create()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.new.complete({ referralId }))
      })
    })

    describe('when there are form errors', () => {
      it('redirects back to the `new` action', async () => {
        referralService.getReferral.mockResolvedValue(draftReferral)
        request.body = { courseName: 'something', otherCourseName: 'something else' }
        ;(CourseParticipationUtils.processCourseFormData as jest.Mock).mockImplementation(
          (_courseName, _otherCourseName, _request) => {
            return { hasFormErrors: true }
          },
        )

        const requestHandler = controller.create()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
        expect(CourseParticipationUtils.processCourseFormData).toHaveBeenCalledWith(
          request.body.courseName,
          request.body.otherCourseName,
          request,
        )
        expect(response.redirect).toHaveBeenCalledWith(referPaths.new.programmeHistory.new({ referralId }))
      })
    })
  })

  describe('delete', () => {
    it('renders the delete template for a specific course participation', async () => {
      const addedByUser = userFactory.build()
      const course = courseFactory.build()
      const courseParticipation = courseParticipationFactory.build({
        addedBy: addedByUser.username,
        courseName: course.name,
        prisonNumber: person.prisonNumber,
      })
      const courseParticipationId = courseParticipation.id

      request.params.courseParticipationId = courseParticipationId

      personService.getPerson.mockResolvedValue(person)
      referralService.getReferral.mockResolvedValue(draftReferral)
      courseService.getCourse.mockResolvedValue(course)
      courseService.getParticipation.mockResolvedValue(courseParticipation)

      const requestHandler = controller.delete()
      await requestHandler(request, response, next)

      expect(referralService.getReferral).toHaveBeenCalledWith(username, request.params.referralId)
      expect(courseService.getParticipation).toHaveBeenCalledWith(username, courseParticipationId)
      expect(courseService.presentCourseParticipation).toHaveBeenCalledWith(
        userToken,
        courseParticipation,
        referralId,
        {
          change: false,
          remove: false,
        },
      )
      expect(response.render).toHaveBeenCalledWith('referrals/new/courseParticipations/delete', {
        action: `${referPaths.new.programmeHistory.destroy({ courseParticipationId, referralId })}?_method=DELETE`,
        pageHeading: 'Remove programme',
        person,
        referralId,
        summaryListOptions,
      })
    })

    describe('when the referral has been submitted', () => {
      it('redirects to the referral confirmation action', async () => {
        referralService.getReferral.mockResolvedValue(submittedReferral)

        const requestHandler = controller.delete()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, request.params.referralId)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.new.complete({ referralId }))
      })
    })
  })

  describe('destroy', () => {
    it('asks the service to delete the participation and redirects to the index action', async () => {
      referralService.getReferral.mockResolvedValue(draftReferral)

      const courseParticipationId = 'aCourseParticipationId'
      request.params.courseParticipationId = courseParticipationId

      const requestHandler = controller.destroy()
      await requestHandler(request, response, next)

      expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
      expect(courseService.deleteParticipation).toHaveBeenCalledWith(username, courseParticipationId)
      expect(request.flash).toHaveBeenCalledWith('successMessage', 'You have successfully removed a programme.')
      expect(response.redirect).toHaveBeenCalledWith(referPaths.new.programmeHistory.index({ referralId }))
    })

    describe('when the referral has been submitted', () => {
      it('redirects to the referral confirmation action', async () => {
        referralService.getReferral.mockResolvedValue(submittedReferral)

        const requestHandler = controller.destroy()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.new.complete({ referralId }))
      })
    })
  })

  describe('editCourse', () => {
    const courses = courseFactory.buildList(2)
    const courseNames = courses.map(course => course.name)
    const courseParticipationWithKnownCoursename = courseParticipationFactory.build({
      courseName: courses[0].name,
      prisonNumber: person.prisonNumber,
    })
    const courseParticipationWithUnknownCourseName = courseParticipationFactory.build({
      courseName: 'A course not in our system',
      prisonNumber: person.prisonNumber,
    })

    describe.each([
      ['a known', courseParticipationWithKnownCoursename],
      ['an unknown', courseParticipationWithUnknownCourseName],
    ])(
      'when the participation has %s `courseName`',
      (courseNameType: string, courseParticipation: CourseParticipation) => {
        it('renders the edit template for selecting a course', async () => {
          request.params = { courseParticipationId: courseParticipation.id, referralId }
          courseService.getParticipation.mockResolvedValue(courseParticipation)
          referralService.getReferral.mockResolvedValue(draftReferral)
          personService.getPerson.mockResolvedValue(person)
          courseService.getCourseNames.mockResolvedValue(courseNames)
          ;(FormUtils.setFieldErrors as jest.Mock).mockImplementation((_request, _response, _fields) => {
            response.locals.errors = { list: [], messages: {} }
          })

          const requestHandler = controller.editCourse()
          await requestHandler(request, response, next)

          const { courseName } = courseParticipation
          const isKnownCourse = courseNameType === 'a known'

          expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
          expect(response.render).toHaveBeenCalledWith('referrals/new/courseParticipations/course', {
            action: `${referPaths.new.programmeHistory.updateProgramme({
              courseParticipationId: courseParticipation.id,
              referralId,
            })}?_method=PUT`,
            courseRadioOptions: CourseUtils.courseRadioOptions(courseNames),
            formValues: isKnownCourse ? { courseName } : { courseName: 'Other', otherCourseName: courseName },
            otherCourseNameChecked: !isKnownCourse,
            pageHeading: 'Add Accredited Programme history',
            person,
            referralId,
          })
          expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['courseName', 'otherCourseName'])
        })
      },
    )

    describe('when the referral has been submitted', () => {
      it('redirects to the referral confirmation action', async () => {
        referralService.getReferral.mockResolvedValue(submittedReferral)

        const requestHandler = controller.editCourse()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.new.complete({ referralId }))
      })
    })
  })

  describe('index', () => {
    const course = courseFactory.build()

    beforeEach(() => {
      personService.getPerson.mockResolvedValue(person)
      courseService.getCourse.mockResolvedValue(course)
      ;(request.flash as jest.Mock).mockImplementation(() => [])
    })

    it("renders the index template for a person's programme history", async () => {
      referralService.getReferral.mockResolvedValue(draftReferral)

      const requestHandler = controller.index()
      await requestHandler(request, response, next)

      expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
      expect(courseService.getAndPresentParticipationsByPerson).toHaveBeenCalledWith(
        username,
        userToken,
        person.prisonNumber,
        referralId,
      )

      expect(response.render).toHaveBeenCalledWith('referrals/new/courseParticipations/index', {
        action: `${referPaths.new.programmeHistory.updateReviewedStatus({ referralId })}?_method=PUT`,
        historyText: `The history shows ${person.name} has previously started or completed an Accredited Programme.`,
        pageHeading: 'Accredited Programme history',
        person,
        referralId,
        successMessage: undefined,
        summaryListsOptions: [summaryListOptions, summaryListOptions],
      })
    })

    describe('when there is no programme history for a person', () => {
      it('renders the index template with the correct response locals for `historyText` and `summaryListsOptions`', async () => {
        referralService.getReferral.mockResolvedValue(draftReferral)
        courseService.getAndPresentParticipationsByPerson.mockResolvedValue([])

        const requestHandler = controller.index()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
        expect(courseService.getAndPresentParticipationsByPerson).toHaveBeenCalledWith(
          username,
          userToken,
          person.prisonNumber,
          referralId,
        )

        expect(response.render).toHaveBeenCalledWith(
          'referrals/new/courseParticipations/index',
          expect.objectContaining({
            historyText: `There is no record of Accredited Programmes for ${person.name}.`,
            summaryListsOptions: [],
          }),
        )
      })
    })

    describe('when there is a success message', () => {
      it('passes the message to the template', async () => {
        referralService.getReferral.mockResolvedValue(draftReferral)

        const successMessage = 'A success message'
        ;(request.flash as jest.Mock).mockImplementation(() => [successMessage])

        const requestHandler = controller.index()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'referrals/new/courseParticipations/index',
          expect.objectContaining({
            successMessage,
          }),
        )
      })
    })

    describe('when the referral has been submitted', () => {
      it('redirects to the referral confirmation action', async () => {
        referralService.getReferral.mockResolvedValue(submittedReferral)

        const requestHandler = controller.index()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.new.complete({ referralId }))
      })
    })
  })

  describe('new', () => {
    it('renders the new template for selecting a course', async () => {
      const courses = courseFactory.buildList(2)
      const courseNames = courses.map(course => course.name)
      courseService.getCourseNames.mockResolvedValue(courseNames)

      personService.getPerson.mockResolvedValue(person)

      referralService.getReferral.mockResolvedValue(draftReferral)

      const emptyErrorsLocal = { list: [], messages: {} }
      ;(FormUtils.setFieldErrors as jest.Mock).mockImplementation((_request, _response, _fields) => {
        response.locals.errors = emptyErrorsLocal
      })

      const requestHandler = controller.new()
      await requestHandler(request, response, next)

      expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
      expect(response.render).toHaveBeenCalledWith('referrals/new/courseParticipations/course', {
        action: referPaths.new.programmeHistory.create({ referralId }),
        courseRadioOptions: CourseUtils.courseRadioOptions(courseNames),
        formValues: {},
        otherCourseNameChecked: false,
        pageHeading: 'Add Accredited Programme history',
        person,
        referralId,
      })
      expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['courseName', 'otherCourseName'])
    })

    describe('when the referral has been submitted', () => {
      it('redirects to the referral confirmation action', async () => {
        referralService.getReferral.mockResolvedValue(submittedReferral)

        const requestHandler = controller.new()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.new.complete({ referralId }))
      })
    })
  })

  describe('updateCourse', () => {
    describe.each([
      ['when the `courseName` is a non-empty string and not "Other"', false],
      ['when the `courseName` is "Other" and `otherCourseName` is a non-empty string when trimmed', true],
    ])('%s', (_description: string, isOtherCourse: boolean) => {
      it('asks the service to update the course data and redirects to the details action', async () => {
        referralService.getReferral.mockResolvedValue(draftReferral)

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

        const requestHandler = controller.updateCourse()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
        expect(courseService.getParticipation).toHaveBeenCalledWith(username, request.params.courseParticipationId)
        expect(CourseParticipationUtils.processCourseFormData).toHaveBeenCalledWith(
          request.body.courseName,
          request.body.otherCourseName,
          request,
        )
        expect(courseService.updateParticipation).toHaveBeenCalledWith(
          username,
          courseParticipation.id,
          courseParticipationUpdate,
        )
        expect(request.flash).toHaveBeenCalledWith('successMessage', 'You have successfully updated a programme.')
        expect(response.redirect).toHaveBeenCalledWith(
          referPaths.new.programmeHistory.details.show({
            courseParticipationId: courseParticipation.id,
            referralId,
          }),
        )
      })
    })

    describe('when the referral has been submitted', () => {
      it('redirects to the referral confirmation action', async () => {
        referralService.getReferral.mockResolvedValue(submittedReferral)

        const requestHandler = controller.updateCourse()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.new.complete({ referralId }))
      })
    })

    describe('when there are form errors', () => {
      it('redirects back to the `editCourse` action', async () => {
        referralService.getReferral.mockResolvedValue(draftReferral)

        const courseParticipation = courseParticipationFactory.build()
        request.params.courseParticipationId = courseParticipation.id
        courseService.getParticipation.mockResolvedValue(courseParticipation)

        request.body = { courseName: 'something', otherCourseName: 'something else' }
        ;(CourseParticipationUtils.processCourseFormData as jest.Mock).mockImplementation(
          (_courseName, _otherCourseName, _request) => {
            return { hasFormErrors: true }
          },
        )

        const requestHandler = controller.updateCourse()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
        expect(courseService.getParticipation).toHaveBeenCalledWith(username, request.params.courseParticipationId)
        expect(CourseParticipationUtils.processCourseFormData).toHaveBeenCalledWith(
          request.body.courseName,
          request.body.otherCourseName,
          request,
        )
        expect(response.redirect).toHaveBeenCalledWith(
          referPaths.new.programmeHistory.editProgramme({
            courseParticipationId: courseParticipation.id,
            referralId,
          }),
        )
      })
    })
  })

  describe('updateHasReviewedProgrammeHistory', () => {
    it('asks the service to update the referral and redirects to the index action', async () => {
      referralService.getReferral.mockResolvedValue(draftReferral)

      const hasReviewedProgrammeHistory = true
      request.body = { hasReviewedProgrammeHistory: hasReviewedProgrammeHistory.toString() }

      const requestHandler = controller.updateHasReviewedProgrammeHistory()
      await requestHandler(request, response, next)

      expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
      expect(referralService.updateReferral).toHaveBeenCalledWith(username, referralId, {
        additionalInformation: draftReferral.additionalInformation,
        hasReviewedProgrammeHistory,
        oasysConfirmed: draftReferral.oasysConfirmed,
      })
      expect(response.redirect).toHaveBeenCalledWith(referPaths.new.show({ referralId }))
    })

    describe('when the referral has been submitted', () => {
      it('redirects to the referral confirmation action', async () => {
        referralService.getReferral.mockResolvedValue(submittedReferral)

        const requestHandler = controller.updateHasReviewedProgrammeHistory()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.new.complete({ referralId }))
      })
    })
  })
})
