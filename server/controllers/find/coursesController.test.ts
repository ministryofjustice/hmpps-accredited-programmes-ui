import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import CoursesController from './coursesController'
import type { CourseService } from '../../services'
import { courseFactory } from '../../testutils/factories'
import courseWithPrerequisiteSummaryListRows from '../../utils/courseUtils'

describe('CoursesController', () => {
  const token = 'SOME_TOKEN'
  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
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

      const coursesWithPrerequisiteSummaryListRows = courses.map(course =>
        courseWithPrerequisiteSummaryListRows(course),
      )

      const requestHandler = coursesController.index()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('courses/index', {
        pageHeading: 'List of accredited programmes',
        courses: coursesWithPrerequisiteSummaryListRows,
      })

      expect(courseService.getCourses).toHaveBeenCalledWith(token)
    })
  })
})
