import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'

import CourseParticipationsController from './courseParticipationsController'
import type { CourseService, PersonService, ReferralService } from '../../services'
import { courseFactory, courseParticipationFactory, personFactory, referralFactory } from '../../testutils/factories'
import { CourseParticipationUtils, CourseUtils } from '../../utils'

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
    response = createMock<Response>({})
    courseParticipationsController = new CourseParticipationsController(courseService, personService, referralService)
  })

  afterEach(() => {
    jest.resetAllMocks()
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
    it('renders the new template for selecting a course/programme', async () => {
      const courses = courseFactory.buildList(2)
      courseService.getCourses.mockResolvedValue(courses)

      const person = personFactory.build()
      personService.getPerson.mockResolvedValue(person)

      const referral = referralFactory.started().build({ prisonNumber: person.prisonNumber })
      referralService.getReferral.mockResolvedValue(referral)

      const requestHandler = courseParticipationsController.new()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/courseParticipations/new', {
        courseRadioOptions: CourseUtils.courseRadioOptions(courses),
        pageHeading: 'Add Accredited Programme history',
        person,
      })
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
})
