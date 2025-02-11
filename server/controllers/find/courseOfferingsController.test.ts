import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import CourseOfferingsController from './courseOfferingsController'
import { findPaths, referPaths } from '../../paths'
import type { CourseService, OrganisationService } from '../../services'
import { courseFactory, courseOfferingFactory, organisationFactory } from '../../testutils/factories'
import { CourseUtils, OrganisationUtils } from '../../utils'

describe('CoursesOfferingsController', () => {
  const userToken = 'SOME_TOKEN'
  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const courseService = createMock<CourseService>({})
  const organisationService = createMock<OrganisationService>({})
  const course = courseFactory.build()
  const courseOffering = courseOfferingFactory.build()

  let controller: CourseOfferingsController

  beforeEach(() => {
    request = createMock<Request>({ user: { token: userToken } })
    response = createMock<Response>({})
    controller = new CourseOfferingsController(courseService, organisationService)
  })

  describe('delete', () => {
    it('deletes the course offering and redirects to the course show page', async () => {
      const courseId = 'COURSE-ID'
      const courseOfferingId = 'COURSE-OFFERING-ID'

      request.params = { courseId, courseOfferingId }

      const requestHandler = controller.delete()
      await requestHandler(request, response, next)

      expect(courseService.deleteOffering).toHaveBeenCalledWith(userToken, courseId, courseOfferingId)
      expect(response.redirect).toHaveBeenCalledWith(`/find/programmes/${courseId}`)
    })
  })

  describe('show', () => {
    courseService.getCourseByOffering.mockResolvedValue(course)
    courseService.getOffering.mockResolvedValue(courseOffering)

    it('renders the course offering show template', async () => {
      const organisation = organisationFactory.build({ id: courseOffering.organisationId })
      organisationService.getOrganisation.mockResolvedValue(organisation)

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      const coursePresenter = CourseUtils.presentCourse(course)

      expect(response.render).toHaveBeenCalledWith('courses/offerings/show', {
        course: coursePresenter,
        courseOffering,
        deleteOfferingAction: `/find/programmes/${course.id}/offerings/${courseOffering.id}/delete?_method=DELETE`,
        hideTitleServiceName: true,
        hrefs: {
          back: findPaths.show({ courseId: course.id }),
          makeReferral: referPaths.new.start({ courseOfferingId: courseOffering.id }),
          updateOffering: findPaths.offerings.update.show({
            courseOfferingId: courseOffering.id,
          }),
        },
        organisation: OrganisationUtils.presentOrganisationWithOfferingEmails(
          organisation,
          courseOffering,
          course.name,
        ),
        pageHeading: coursePresenter.displayName,
        pageTitleOverride: `${coursePresenter.displayName} programme at ${organisation.name}`,
      })
    })
  })
})
