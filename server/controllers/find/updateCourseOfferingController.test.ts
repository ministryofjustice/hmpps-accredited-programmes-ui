import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { when } from 'jest-when'

import UpdateCourseOfferingController from './updateCourseOfferingController'
import { findPaths } from '../../paths'
import type { CourseService, OrganisationService } from '../../services'
import { courseFactory, courseOfferingFactory, prisonFactory } from '../../testutils/factories'
import { OrganisationUtils } from '../../utils'
import type { GovukFrontendSelectItem } from '@govuk-frontend'

jest.mock('../../utils/organisationUtils')

const mockOrganisationUtils = OrganisationUtils as jest.Mocked<typeof OrganisationUtils>

describe('UpdateCourseOfferingController', () => {
  let controller: UpdateCourseOfferingController
  let request: Request
  let response: Response

  const username = 'SOME_USERNAME'
  const userToken = 'USER_TOKEN'
  const courseService = createMock<CourseService>({})
  const organisationService = createMock<OrganisationService>({})
  const courseOffering = courseOfferingFactory.build({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  beforeEach(() => {
    controller = new UpdateCourseOfferingController(courseService, organisationService)
    request = createMock<Request>({
      params: { courseOfferingId: courseOffering.id },
      user: { token: userToken, username },
    })
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
      when(courseService.getOffering).calledWith(userToken, courseOffering.id).mockResolvedValue(courseOffering)
    })

    it('renders the update course offering form template with organisation select items', async () => {
      const organisations = prisonFactory.buildList(3)
      organisationService.getAllOrganisations.mockResolvedValue(organisations)

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(organisationService.getAllOrganisations).toHaveBeenCalledWith(userToken)

      expect(response.render).toHaveBeenCalledWith('courses/offerings/form/show', {
        action: `/find/offerings/${courseOffering.id}/update?_method=PUT`,
        backLinkHref: `/find/offerings/${courseOffering.id}`,
        offering: courseOffering,
        organisationSelectItems,
        pageHeading: 'Update location',
      })
      expect(OrganisationUtils.organisationSelectItems).toHaveBeenCalledWith(organisations)
    })
  })

  describe('submit', () => {
    const course = courseFactory.build({})

    beforeEach(() => {
      when(courseService.getCourseByOffering).calledWith(userToken, courseOffering.id).mockResolvedValue(course)
    })

    it('updates a course offering and redirects back to the offering page', async () => {
      const updatedCourseOfferingBody: Record<string, string> = {
        contactEmail: 'contact-email@test.com',
        organisationId: 'organisation-id',
        referable: 'true',
        secondaryContactEmail: 'secondary-contact-email@test.com',
        withdrawn: 'false',
      }

      courseService.updateCourseOffering.mockResolvedValue(courseOffering)

      request.body = updatedCourseOfferingBody

      const requestHandler = controller.submit()
      await requestHandler(request, response, next)

      expect(courseService.updateCourseOffering).toHaveBeenCalledWith(username, course.id, {
        ...updatedCourseOfferingBody,
        id: courseOffering.id,
        referable: true,
        withdrawn: false,
      })
      expect(response.redirect).toHaveBeenCalledWith(findPaths.offerings.show({ courseOfferingId: courseOffering.id }))
    })
  })
})
