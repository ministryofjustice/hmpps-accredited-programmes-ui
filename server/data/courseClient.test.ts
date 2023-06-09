import { Matchers } from '@pact-foundation/pact'
import { pactWith } from 'jest-pact'

import CourseClient from './courseClient'
import config from '../config'
import apiPaths from '../paths/api'
import { courseFactory, courseOfferingFactory } from '../testutils/factories'

pactWith({ consumer: 'Accredited Programmes UI', provider: 'Accredited Programmes API' }, provider => {
  let courseClient: CourseClient

  const token = 'token-1'

  beforeEach(() => {
    courseClient = new CourseClient(token)
    config.apis.accreditedProgrammesApi.url = provider.mockService.baseUrl
  })

  const course1 = courseFactory.build({
    id: '28e47d30-30bf-4dab-a8eb-9fda3f6400e8',
    alternateName: 'AC++',
  })
  const course2 = courseFactory.build({
    id: 'd3abc217-75ee-46e9-a010-368f30282367',
    alternateName: 'LC',
  })
  const course3 = courseFactory.build({
    id: '1811faa6-d568-4fc4-83ce-41118b90242e',
    alternateName: null,
  })
  const allCourses = [course1, course2, course3]
  const courseOfferings = courseOfferingFactory.buildList(3)
  const courseOffering = courseOfferingFactory.build({
    id: '20f3abc8-dd92-43ae-b88e-5797a0ad3f4b',
    secondaryContactEmail: 'nobody2-iry@digital.justice.gov.uk',
  })

  describe('all', () => {
    beforeEach(() => {
      provider.addInteraction({
        state: 'Courses exist on the API',
        uponReceiving: 'A request for all courses',
        withRequest: {
          method: 'GET',
          path: apiPaths.courses.index({}),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like(allCourses),
        },
      })
    })

    it('fetches all courses', async () => {
      const result = await courseClient.all()

      expect(result).toEqual(allCourses)
    })
  })

  describe('find', () => {
    beforeEach(() => {
      provider.addInteraction({
        state: `A course exists with ID ${course1.id}`,
        uponReceiving: `A request for course "${course1.id}"`,
        withRequest: {
          method: 'GET',
          path: apiPaths.courses.show({ courseId: course1.id }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like(course1),
        },
      })
    })

    it('fetches the given course', async () => {
      const result = await courseClient.find(course1.id)

      expect(result).toEqual(course1)
    })
  })

  describe('findOfferings', () => {
    beforeEach(() => {
      provider.addInteraction({
        state: `Offerings exist for a course with ID ${course1.id}`,
        uponReceiving: `A request for course "${course1.id}"'s offerings`,
        withRequest: {
          method: 'GET',
          path: apiPaths.courses.offerings.index({ courseId: course1.id }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like(courseOfferings),
        },
      })
    })

    it("fetches the given course's offerings", async () => {
      const result = await courseClient.findOfferings(course1.id)

      expect(result).toEqual(courseOfferings)
    })
  })

  describe('findOffering', () => {
    beforeEach(() => {
      provider.addInteraction({
        state: `An offering exists with ID ${courseOffering.id}`,
        uponReceiving: `A request for course offering "${courseOffering.id}"`,
        withRequest: {
          method: 'GET',
          path: apiPaths.courses.offerings.show({ courseId: course1.id, courseOfferingId: courseOffering.id }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like(courseOffering),
        },
      })
    })

    it('fetches the given course offering', async () => {
      const result = await courseClient.findOffering(course1.id, courseOffering.id)

      expect(result).toEqual(courseOffering)
    })
  })
})
