import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import CourseParticipationsController from './courseParticipationsController'
import type { CourseService } from '../../services'
import { courseFactory } from '../../testutils/factories'
import { CourseUtils } from '../../utils'

describe('CourseParticipationsController', () => {
  const token = 'SOME_TOKEN'
  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const courseService = createMock<CourseService>({})

  let courseParticipationsController: CourseParticipationsController

  beforeEach(() => {
    request = createMock<Request>({ user: { token } })
    response = createMock<Response>({})
    courseParticipationsController = new CourseParticipationsController(courseService)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('new', () => {
    it('renders the new template for selecting a course/programme', async () => {
      const courses = courseFactory.buildList(2)
      courseService.getCourses.mockResolvedValue(courses)

      const requestHandler = courseParticipationsController.new()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/courseParticipations/new', {
        courseRadioOptions: CourseUtils.courseRadioOptions(courses),
        pageHeading: 'Add Accredited Programme history',
      })
    })
  })
})
