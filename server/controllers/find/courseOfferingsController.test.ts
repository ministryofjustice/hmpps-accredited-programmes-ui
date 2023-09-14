import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'

import CourseOfferingsController from './courseOfferingsController'
import type { CourseService, OrganisationService } from '../../services'
import { courseFactory, courseOfferingFactory, organisationFactory } from '../../testutils/factories'
import { CourseUtils, OrganisationUtils } from '../../utils'

describe('CoursesOfferingsController', () => {
  describe('show', () => {
    const token = 'SOME_TOKEN'
    let request: DeepMocked<Request>
    let response: DeepMocked<Response>
    const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
    const courseService = createMock<CourseService>({})
    const organisationService = createMock<OrganisationService>({})
    const course = courseFactory.build()
    const courseOffering = courseOfferingFactory.build()

    let courseOfferingsController: CourseOfferingsController

    courseService.getCourseByOffering.mockResolvedValue(course)
    courseService.getOffering.mockResolvedValue(courseOffering)

    beforeEach(() => {
      request = createMock<Request>({ user: { token } })
      response = createMock<Response>({})
      courseOfferingsController = new CourseOfferingsController(courseService, organisationService)
    })

    it('renders the course offering show template', async () => {
      const organisation = organisationFactory.build({ id: courseOffering.organisationId })
      organisationService.getOrganisation.mockResolvedValue(organisation)

      const requestHandler = courseOfferingsController.show()
      await requestHandler(request, response, next)

      const coursePresenter = CourseUtils.presentCourse(course)

      expect(response.render).toHaveBeenCalledWith('courses/offerings/show', {
        course: coursePresenter,
        courseOffering,
        organisation: OrganisationUtils.presentOrganisationWithOfferingEmails(
          organisation,
          courseOffering,
          course.name,
        ),
        pageHeading: coursePresenter.nameAndAlternateName,
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
