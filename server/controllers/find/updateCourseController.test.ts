import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { when } from 'jest-when'

import UpdateCourseController from './updateCourseController'
import { findPaths } from '../../paths'
import type { CourseService } from '../../services'
import { audienceFactory, courseFactory } from '../../testutils/factories'
import { CourseUtils } from '../../utils'
import type { GovukFrontendSelectItem } from '@govuk-frontend'

jest.mock('../../utils/courseUtils')

const mockCourseUtils = CourseUtils as jest.Mocked<typeof CourseUtils>

describe('UpdateCourseController', () => {
  let controller: UpdateCourseController
  let request: Request
  let response: Response

  const username = 'SOME_USERNAME'
  const userToken = 'USER_TOKEN'
  const course = courseFactory.build({ audience: 'Extremism offence' })
  const courseService = createMock<CourseService>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  beforeEach(() => {
    controller = new UpdateCourseController(courseService)
    request = createMock<Request>({ params: { courseId: course.id }, user: { token: userToken, username } })
    response = createMock<Response>()
  })

  describe('show', () => {
    const audienceSelectItems: Array<GovukFrontendSelectItem> = [
      { text: 'Audience 1', value: '1' },
      { text: 'Audience 2', value: '2' },
      { text: 'Audience 3', value: '3' },
    ]

    beforeEach(() => {
      mockCourseUtils.audienceSelectItems.mockReturnValue(audienceSelectItems)
      when(courseService.getCourse).calledWith(username, course.id).mockResolvedValue(course)
    })

    it('renders the update course form template with course values audience select items', async () => {
      const audiences = [
        audienceFactory.build({ id: 'audience-id-1', name: 'All offences' }),
        audienceFactory.build({ id: 'audience-id-2', name: 'Extremism offence' }),
        audienceFactory.build({ id: 'audience-id-3', name: 'General offence' }),
      ]
      courseService.getCourseAudiences.mockResolvedValue(audiences)

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(courseService.getCourseAudiences).toHaveBeenCalledWith(userToken)

      expect(response.render).toHaveBeenCalledWith('courses/form/show', {
        action: `/find/programmes/${course.id}/update?_method=PUT`,
        audienceSelectItems,
        backLinkHref: `/find/programmes/${course.id}`,
        formValues: {
          ...course,
          audienceId: 'audience-id-2',
        },
        pageHeading: 'Update Programme',
      })
      expect(CourseUtils.audienceSelectItems).toHaveBeenCalledWith(audiences)
    })
  })

  describe('submit', () => {
    const audience = audienceFactory.build()
    const updateCourseBody: Record<string, string> = {
      alternateName: 'TC+1',
      audienceId: audience.id!,
      description: 'Test course description',
      name: 'Test Course',
      withdrawn: 'false',
    }
    const updatedCourse = courseFactory.build({
      alternateName: updateCourseBody.alternateName,
      audience: audience.name,
      audienceColour: audience.colour,
      description: updateCourseBody.description,
      id: course.id,
      name: updateCourseBody.name,
    })

    it('updates a course and redirects back to the course page', async () => {
      courseService.updateCourse.mockResolvedValue(updatedCourse)

      request.body = updateCourseBody

      const requestHandler = controller.submit()
      await requestHandler(request, response, next)

      expect(courseService.updateCourse).toHaveBeenCalledWith(username, course.id, {
        ...updateCourseBody,
        withdrawn: false,
      })
      expect(response.redirect).toHaveBeenCalledWith(findPaths.show({ courseId: updatedCourse.id }))
      expect(courseService.updateCoursePrerequisites).not.toHaveBeenCalled()
    })

    describe('when prerequisites are provided', () => {
      it('updates a course with prerequisites and redirects to the updated course page', async () => {
        const prerequisites = {
          '1': { description: 'Prerequisite 1 description', name: 'Prerequisite 1' },
          '2': { description: 'Prerequisite 2 description', name: '' },
          '3': { description: '', name: 'Prerequisite 3' },
          '4': { description: '', name: '' },
        }

        courseService.updateCourse.mockResolvedValue(updatedCourse)

        request.body = { ...updateCourseBody, prerequisites }

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(courseService.updateCourse).toHaveBeenCalledWith(username, course.id, {
          ...updateCourseBody,
          withdrawn: false,
        })
        expect(courseService.updateCoursePrerequisites).toHaveBeenCalledWith(username, updatedCourse.id, [
          { description: 'Prerequisite 1 description', name: 'Prerequisite 1' },
        ])
        expect(response.redirect).toHaveBeenCalledWith(findPaths.show({ courseId: updatedCourse.id }))
      })
    })
  })
})
