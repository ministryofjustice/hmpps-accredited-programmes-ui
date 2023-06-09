import { Matchers } from '@pact-foundation/pact'
import { pactWith } from 'jest-pact'

import CourseClient from './courseClient'
import config from '../config'
import paths from '../paths/api'
import { courseFactory, courseOfferingFactory } from '../testutils/factories'

pactWith({ consumer: 'Accredited Programmes UI', provider: 'Accredited Programmes API' }, provider => {
  let courseClient: CourseClient

  const token = 'token-1'

  beforeEach(() => {
    courseClient = new CourseClient(token)
    config.apis.accreditedProgrammesApi.url = provider.mockService.baseUrl
  })

  const allCourses = courseFactory.buildList(3)
  const course = courseFactory.build({
    id: '28e47d30-30bf-4dab-a8eb-9fda3f6400e8',
  })
  const courseOfferings = courseOfferingFactory.buildList(3)
  const courseOffering = courseOfferingFactory.build({
    id: '20f3abc8-dd92-43ae-b88e-5797a0ad3f4b',
  })

  describe('all', () => {
    beforeEach(() => {
      provider.addInteraction({
        state: 'Courses exist on the API',
        uponReceiving: 'A request for all courses',
        withRequest: {
          method: 'GET',
          path: paths.courses.index({}),
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

    it('should fetch all courses', async () => {
      const result = await courseClient.all()

      expect(result).toEqual(allCourses)
    })
  })

  describe('find', () => {
    beforeEach(() => {
      provider.addInteraction({
        state: `A course exists with ID ${course.id}`,
        uponReceiving: `A request for course "${course.id}"`,
        withRequest: {
          method: 'GET',
          path: paths.courses.show({ id: course.id }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like(course),
        },
      })
    })

    it('should fetch the given course', async () => {
      const result = await courseClient.find(course.id)

      expect(result).toEqual(course)
    })
  })

  describe('findOfferings', () => {
    beforeEach(() => {
      provider.addInteraction({
        state: `Offerings exist for a course with ID ${course.id}`,
        uponReceiving: `A request for course "${course.id}"'s offerings`,
        withRequest: {
          method: 'GET',
          path: paths.courses.offerings.index({ id: course.id }),
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

    it("should fetch the given course's offerings", async () => {
      const result = await courseClient.findOfferings(course.id)

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
          path: paths.courses.offerings.show({ id: course.id, courseOfferingId: courseOffering.id }),
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

    it('should fetch the given course offering', async () => {
      const result = await courseClient.findOffering(course.id, courseOffering.id)

      expect(result).toEqual(courseOffering)
    })
  })
})
