import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { when } from 'jest-when'

import CoursesController from './coursesController'
import type { CourseService, OrganisationService } from '../../services'
import { courseFactory, courseOfferingFactory, organisationFactory } from '../../testutils/factories'
import presentCourse from '../../utils/courseUtils'
import organisationTableRows from '../../utils/organisationUtils'
import type { Course } from '@accredited-programmes/models'

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

    describe('when all organisations are found by the organisation service', () => {
      it('renders the course show template with all organisations', async () => {
        const organisations = organisationFactory.buildList(3)

        organisations.forEach(organisation => {
          when(organisationService.getOrganisation).calledWith(token, organisation.id).mockResolvedValue(organisation)
        })

        const courseOfferings = organisations.map(organisation =>
          courseOfferingFactory.build({ organisationId: organisation.id }),
        )

        courseService.getOfferingsByCourse.mockResolvedValue(courseOfferings)

        const requestHandler = coursesController.show()

        await requestHandler(request, response, next)

        organisations.forEach(organisation =>
          expect(organisationService.getOrganisation).toHaveBeenCalledWith(token, organisation.id),
        )

        expect(response.render).toHaveBeenCalledWith('courses/show', {
          pageHeading: course.name,
          course: presentCourse(course),
          organisationsTableData: organisationTableRows(course, organisations),
        })
      })
    })

    describe('when some but not all organisations are found by the organisation service', () => {
      it('renders the course show template with the found organisations', async () => {
        const existingOrganisations = organisationFactory.buildList(2)
        const nonexistentOrganisation = organisationFactory.build({ id: 'NOTFOUND' })
        const allOrganisations = [...existingOrganisations, nonexistentOrganisation]

        const courseOfferingsForExistingOrganisations = existingOrganisations.map(organisation =>
          courseOfferingFactory.build({ organisationId: organisation.id }),
        )

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

        expect(response.render).toHaveBeenCalledWith('courses/show', {
          pageHeading: course.name,
          course: presentCourse(course),
          organisationsTableData: organisationTableRows(course, existingOrganisations),
        })
      })
    })
  })
})
