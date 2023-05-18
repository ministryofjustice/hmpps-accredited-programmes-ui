import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { NextFunction, Request, Response } from 'express'

import CoursesController from './coursesController'
import { CourseService } from '../../services'
import { courseFactory } from '../../testutils/factories'
import { courseListItems } from '../../utils/courseUtils'

describe('CoursesController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const courseService = createMock<CourseService>({})

  let coursesController: CoursesController

  beforeEach(() => {
    coursesController = new CoursesController(courseService)
  })

  describe('index', () => {
    it('should render the courses index template', async () => {
      const courses = courseFactory.buildList(3)
      courseService.getCourses.mockResolvedValue(courses)

      const requestHandler = coursesController.index()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('courses/index', {
        pageHeading: 'List of accredited programmes',
        courseListItems: courseListItems(courses),
      })

      expect(courseService.getCourses).toHaveBeenCalledWith('token')
    })
  })
})
