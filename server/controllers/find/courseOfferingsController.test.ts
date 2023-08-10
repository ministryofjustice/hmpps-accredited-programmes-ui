import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import CourseOfferingsController from './courseOfferingsController'
import type { CourseService, OrganisationService } from '../../services'
import { courseFactory, courseOfferingFactory, organisationFactory } from '../../testutils/factories'
import { courseUtils, organisationUtils } from '../../utils'

describe('CoursesOfferingsController', () => {
  describe('show', () => {
    it('renders the course offering show template', async () => {
      const token = 'SOME_TOKEN'
      const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
      const response: DeepMocked<Response> = createMock<Response>({})
      const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

      const courseService = createMock<CourseService>({})
      const organisationService = createMock<OrganisationService>({})

      const course = courseFactory.build()
      courseService.getCourse.mockResolvedValue(course)

      const courseOffering = courseOfferingFactory.build()
      courseService.getOffering.mockResolvedValue(courseOffering)

      const organisation = organisationFactory.build({ id: courseOffering.organisationId })
      organisationService.getOrganisation.mockResolvedValue(organisation)

      const courseOfferingsController = new CourseOfferingsController(courseService, organisationService)

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
  })
})
