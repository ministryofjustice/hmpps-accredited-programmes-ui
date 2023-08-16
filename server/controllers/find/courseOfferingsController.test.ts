import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'

import CourseOfferingsController from './courseOfferingsController'
import type { CourseService, OrganisationService } from '../../services'
import { courseFactory, courseOfferingFactory, organisationFactory } from '../../testutils/factories'
import { courseUtils, organisationUtils } from '../../utils'

describe('CoursesOfferingsController', () => {
  describe('show', () => {
    const token = 'SOME_TOKEN'
    const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
    const response: DeepMocked<Response> = createMock<Response>({})
    const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
    const courseService = createMock<CourseService>({})
    const organisationService = createMock<OrganisationService>({})
    const course = courseFactory.build()
    const courseOffering = courseOfferingFactory.build()

    let courseOfferingsController: CourseOfferingsController

    courseService.getCourse.mockResolvedValue(course)
    courseService.getOffering.mockResolvedValue(courseOffering)

    beforeEach(() => {
      courseOfferingsController = new CourseOfferingsController(courseService, organisationService)
    })

    it('renders the course offering show template', async () => {
      const organisation = organisationFactory.build({ id: courseOffering.organisationId })
      organisationService.getOrganisation.mockResolvedValue(organisation)

      const requestHandler = courseOfferingsController.show()
      await requestHandler(request, response, next)

      const coursePresenter = courseUtils.presentCourse(course)

      expect(response.render).toHaveBeenCalledWith('courses/offerings/show', {
        pageHeading: coursePresenter.nameAndAlternateName,
        course: coursePresenter,
        courseOffering,
        organisation: organisationUtils.presentOrganisationWithOfferingEmails(
          organisation,
          courseOffering,
          course.name,
        ),
      })
    })

    describe('when the organisation service returns `null`', () => {
      it('responds with a 404', async () => {
        organisationService.getOrganisation.mockResolvedValue(null)

        const requestHandler = courseOfferingsController.show()
        const expectedError = createError(404)

        expect(() => requestHandler(request, response, next)).rejects.toThrowError(expectedError)
      })
    })
  })
})
