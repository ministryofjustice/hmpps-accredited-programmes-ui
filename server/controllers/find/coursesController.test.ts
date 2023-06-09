import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { when } from 'jest-when'

import CoursesController from './coursesController'
import type { CourseService, OrganisationService } from '../../services'
import { courseFactory, courseOfferingFactory, organisationFactory } from '../../testutils/factories'
import presentCourse from '../../utils/courseUtils'
import { organisationTableRows } from '../../utils/organisationUtils'
import type { Course, CourseOffering } from '@accredited-programmes/models'
import type { OrganisationWithOfferingId } from '@accredited-programmes/ui'

describe('CoursesController', () => {
  const token = 'SOME_TOKEN'
  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const courseService = createMock<CourseService>({})
  const organisationService = createMock<OrganisationService>({})

  let coursesController: CoursesController

  beforeEach(() => {
    coursesController = new CoursesController(courseService, organisationService)
  })

  describe('index', () => {
    it('renders the courses index template', async () => {
      const courses = courseFactory.buildList(3)
      courseService.getCourses.mockResolvedValue(courses)

      const requestHandler = coursesController.index()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('courses/index', {
        pageHeading: 'List of accredited programmes',
        courses: courses.map(course => presentCourse(course)),
      })

      expect(courseService.getCourses).toHaveBeenCalledWith(token)
    })
  })

  describe('show', () => {
    let course: Course

    beforeEach(() => {
      course = courseFactory.build()
      courseService.getCourse.mockResolvedValue(course)
    })

    describe('when all organisations are returned by the organisation service', () => {
      it('renders the course show template with all organisations', async () => {
        const organisations = organisationFactory.buildList(3)

        const courseOfferings: Array<CourseOffering> = []
        const organisationsWithOfferingIds: Array<OrganisationWithOfferingId> = []

        organisations.forEach(organisation => {
          when(organisationService.getOrganisation).calledWith(token, organisation.id).mockResolvedValue(organisation)

          const courseOffering = courseOfferingFactory.build({ organisationId: organisation.id })
          courseOfferings.push(courseOffering)
          organisationsWithOfferingIds.push({ ...organisation, courseOfferingId: courseOffering.id })
        })

        courseService.getOfferingsByCourse.mockResolvedValue(courseOfferings)

        const requestHandler = coursesController.show()

        await requestHandler(request, response, next)

        organisations.forEach(organisation =>
          expect(organisationService.getOrganisation).toHaveBeenCalledWith(token, organisation.id),
        )

        const coursePresenter = presentCourse(course)

        expect(response.render).toHaveBeenCalledWith('courses/show', {
          pageHeading: coursePresenter.nameAndAlternateName,
          course: coursePresenter,
          organisationsTableData: organisationTableRows(course, organisationsWithOfferingIds),
        })
      })
    })

    describe('when some but not all organisations are returned by the organisation service', () => {
      it('renders the course show template with the returned organisations', async () => {
        const existingOrganisations = organisationFactory.buildList(2)
        const nonexistentOrganisation = organisationFactory.build({ id: 'NOTFOUND' })
        const allOrganisations = [...existingOrganisations, nonexistentOrganisation]

        const courseOfferingsForExistingOrganisations: Array<CourseOffering> = []
        const existingOrganisationsWithOfferingIds: Array<OrganisationWithOfferingId> = []

        existingOrganisations.forEach(organisation => {
          const courseOffering = courseOfferingFactory.build({ organisationId: organisation.id })
          courseOfferingsForExistingOrganisations.push(courseOffering)
          existingOrganisationsWithOfferingIds.push({ ...organisation, courseOfferingId: courseOffering.id })
        })

        const courseOfferingsForAllOrganisations = [
          ...courseOfferingsForExistingOrganisations,
          courseOfferingFactory.build({ organisationId: nonexistentOrganisation.id }),
        ]

        courseService.getOfferingsByCourse.mockResolvedValue(courseOfferingsForAllOrganisations)

        allOrganisations.forEach(organisation => {
          const resolvedValue = organisation === nonexistentOrganisation ? null : organisation
          when(organisationService.getOrganisation).calledWith(token, organisation.id).mockResolvedValue(resolvedValue)
        })

        const requestHandler = coursesController.show()

        await requestHandler(request, response, next)

        allOrganisations.forEach(organisation =>
          expect(organisationService.getOrganisation).toHaveBeenCalledWith(token, organisation.id),
        )

        const coursePresenter = presentCourse(course)

        expect(response.render).toHaveBeenCalledWith('courses/show', {
          pageHeading: coursePresenter.nameAndAlternateName,
          course: coursePresenter,
          organisationsTableData: organisationTableRows(course, existingOrganisationsWithOfferingIds),
        })
      })
    })
  })
})
