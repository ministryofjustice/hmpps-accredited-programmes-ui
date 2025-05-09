import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import AddCourseOfferingController from './addCourseOfferingController'
import { findPaths } from '../../paths'
import type { CourseService, OrganisationService } from '../../services'
import { courseFactory, courseOfferingFactory, prisonFactory } from '../../testutils/factories'
import { OrganisationUtils } from '../../utils'
import type { GovukFrontendSelectItem } from '@govuk-frontend'

jest.mock('../../utils/organisationUtils')

const mockOrganisationUtils = OrganisationUtils as jest.Mocked<typeof OrganisationUtils>

describe('AddCourseController', () => {
  let controller: AddCourseOfferingController
  let request: Request
  let response: Response

  const username = 'SOME_USERNAME'
  const userToken = 'USER_TOKEN'
  const courseService = createMock<CourseService>({})
  const organisationService = createMock<OrganisationService>({})
  const courseId = 'course-id'
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  beforeEach(() => {
    controller = new AddCourseOfferingController(courseService, organisationService)
    request = createMock<Request>({ params: { courseId }, user: { token: userToken, username } })
    response = createMock<Response>()
  })

  describe('show', () => {
    const organisationSelectItems: Array<GovukFrontendSelectItem> = [
      { text: 'Organisation 1', value: '1' },
      { text: 'Organisation 2', value: '2' },
      { text: 'Organisation 3', value: '3' },
    ]

    beforeEach(() => {
      mockOrganisationUtils.organisationSelectItems.mockReturnValue(organisationSelectItems)
    })

    it('renders the create course offering form template with organisation select items', async () => {
      const organisations = prisonFactory.buildList(3)
      organisationService.getAllOrganisations.mockResolvedValue(organisations)
      const course = courseFactory.build({ displayName: 'Course Name', id: courseId })
      courseService.getCourse.mockResolvedValue(course)

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(organisationService.getAllOrganisations).toHaveBeenCalledWith(userToken)

      expect(response.render).toHaveBeenCalledWith('courses/offerings/form/show', {
        action: '/find/programmes/course-id/offerings/add',
        backLinkHref: '/find/programmes/course-id',
        organisationSelectItems,
        pageHeading: 'Add a Location',
        showBuildingChoicesOptions: false,
      })
      expect(OrganisationUtils.organisationSelectItems).toHaveBeenCalledWith(organisations)
    })
  })

  describe('submit', () => {
    it('creates a course offering and redirects back to the course page', async () => {
      const newCourseOfferingBody: Record<string, string> = {
        contactEmail: 'contact-email@test.com',
        organisationId: 'organisation-id',
        referable: 'true',
        secondaryContactEmail: 'secondary-contact-email@test.com',
        withdrawn: 'false',
      }
      const courseOffering = courseOfferingFactory.build({
        contactEmail: newCourseOfferingBody.contactEmail,
        organisationId: newCourseOfferingBody.organisationId,
        referable: true,
        secondaryContactEmail: newCourseOfferingBody.secondaryContactEmail,
        withdrawn: false,
      })

      const course = courseFactory.build({ displayName: 'Course Name', id: courseId })
      courseService.addCourseOffering.mockResolvedValue(courseOffering)
      courseService.getCourse.mockResolvedValue(course)

      request.body = newCourseOfferingBody

      const requestHandler = controller.submit()
      await requestHandler(request, response, next)

      expect(courseService.addCourseOffering).toHaveBeenCalledWith(username, courseId, {
        ...newCourseOfferingBody,
        referable: true,
        withdrawn: false,
      })
      expect(response.redirect).toHaveBeenCalledWith(findPaths.offerings.show({ courseOfferingId: courseOffering.id }))
    })
  })
})
