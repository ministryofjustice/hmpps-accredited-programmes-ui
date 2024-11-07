import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { when } from 'jest-when'

import BuildingChoicesController from './buildingChoicesController'
import { findPaths } from '../../paths'
import type { CourseService } from '../../services'
import { courseFactory } from '../../testutils/factories'
import { FormUtils } from '../../utils'

jest.mock('../../utils/formUtils')

describe('BuildingChoicesController', () => {
  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let controller: BuildingChoicesController

  const username = 'SOME_USERNAME'
  const courseId = 'A_COURSE_ID'
  const courseService = createMock<CourseService>({})

  beforeEach(() => {
    request = createMock<Request>({ params: { courseId }, user: { username } })
    response = createMock<Response>({})
    controller = new BuildingChoicesController(courseService)
  })

  describe('show', () => {
    it('should render the buildingChoices/show template', async () => {
      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, [
        'isConvictedOfSexualOffence',
        'isInAWomensPrison',
      ])
      expect(FormUtils.setFormValues).toHaveBeenCalledWith(request, response)
      expect(response.render).toHaveBeenCalledWith('courses/offerings/buildingChoices/show', {
        backLinkHref: findPaths.index({}),
        pageHeading: "About the person you're referring",
      })
    })
  })

  describe('submit', () => {
    describe('when all options are selected', () => {
      it('should redirect to the course page of the first course in the response', async () => {
        const returnedCourses = courseFactory.buildList(2)
        const formValues = { isConvictedOfSexualOffence: 'no', isInAWomensPrison: 'yes' }

        when(courseService.getBuildingChoicesVariants)
          .calledWith(username, courseId, formValues)
          .mockResolvedValue(returnedCourses)

        request.body = formValues

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(findPaths.show({ courseId: returnedCourses[0].id }))
      })
    })

    describe('when no options are selected', () => {
      it('should redirect to the show page with errors', async () => {
        request.body = { isConvictedOfSexualOffence: '', isInAWomensPrison: '' }

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(request.flash).toHaveBeenCalledWith('isConvictedOfSexualOffenceError', 'Select an option')
        expect(request.flash).toHaveBeenCalledWith('isInAWomensPrisonError', 'Select an option')
        expect(request.flash).toHaveBeenCalledWith('formValues', [
          JSON.stringify({ isConvictedOfSexualOffence: '', isInAWomensPrison: '' }),
        ])
        expect(response.redirect).toHaveBeenCalledWith(findPaths.buildingChoices.form.show({ courseId }))
      })
    })
  })
})
