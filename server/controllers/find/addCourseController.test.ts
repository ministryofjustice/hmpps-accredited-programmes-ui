import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import AddCourseController from './addCourseController'
import { findPaths } from '../../paths'
import type { CourseService } from '../../services'
import { audienceFactory, courseFactory } from '../../testutils/factories'
import { CourseUtils } from '../../utils'
import type { GovukFrontendSelectItem } from '@govuk-frontend'

jest.mock('../../utils/courseUtils')

const mockCourseUtils = CourseUtils as jest.Mocked<typeof CourseUtils>

describe('AddCourseController', () => {
  let controller: AddCourseController
  let request: Request
  let response: Response

  const username = 'SOME_USERNAME'
  const userToken = 'USER_TOKEN'
  const courseService = createMock<CourseService>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  beforeEach(() => {
    controller = new AddCourseController(courseService)
    request = createMock<Request>({ user: { token: userToken, username } })
    response = createMock<Response>()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('show', () => {
    const audienceSelectItems: Array<GovukFrontendSelectItem> = [
      { text: 'Audience 1', value: '1' },
      { text: 'Audience 2', value: '2' },
      { text: 'Audience 3', value: '3' },
    ]

    beforeEach(() => {
      mockCourseUtils.audienceSelectItems.mockReturnValue(audienceSelectItems)
    })

    it('renders the create course form template with audience select items', async () => {
      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(courseService.getCourseAudiences).toHaveBeenCalledWith(username)
      expect(response.render).toHaveBeenCalledWith('courses/form/show', {
        action: '/find/programmes/add',
        audienceSelectItems,
        backLinkHref: '/find/programmes',
        pageHeading: 'Add a Programme',
      })
    })
  })

  describe('submit', () => {
    const audience = audienceFactory.build()
    const newCourseBody: Record<string, string> = {
      alternateName: 'TC+1',
      audienceId: audience.id!,
      description: 'Test course description',
      name: 'Test Course',
      withdrawn: 'false',
    }
    const createdCourse = courseFactory.build({
      alternateName: newCourseBody.alternateName,
      audience: audience.name,
      audienceColour: audience.colour,
      description: newCourseBody.description,
      name: newCourseBody.name,
    })

    it('creates a course and redirects to the newly created course page', async () => {
      courseService.createCourse.mockResolvedValue(createdCourse)

      request.body = newCourseBody

      const requestHandler = controller.submit()
      await requestHandler(request, response, next)

      expect(courseService.createCourse).toHaveBeenCalledWith(username, { ...newCourseBody, withdrawn: false })
      expect(response.redirect).toHaveBeenCalledWith(findPaths.show({ courseId: createdCourse.id }))
      expect(courseService.updateCoursePrerequisites).not.toHaveBeenCalled()
    })

    describe('when prerequisites are provided', () => {
      it('creates a course with prerequisites and redirects to the newly created course page', async () => {
        const prerequisites = {
          '1': { description: 'Prerequisite 1 description', name: 'Prerequisite 1' },
          '2': { description: 'Prerequisite 2 description', name: '' },
          '3': { description: '', name: 'Prerequisite 3' },
          '4': { description: '', name: '' },
        }

        courseService.createCourse.mockResolvedValue(createdCourse)

        request.body = { ...newCourseBody, prerequisites }

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(courseService.createCourse).toHaveBeenCalledWith(username, { ...newCourseBody, withdrawn: false })
        expect(courseService.updateCoursePrerequisites).toHaveBeenCalledWith(username, createdCourse.id, [
          { description: 'Prerequisite 1 description', name: 'Prerequisite 1' },
        ])
        expect(response.redirect).toHaveBeenCalledWith(findPaths.show({ courseId: createdCourse.id }))
      })
    })
  })
})
