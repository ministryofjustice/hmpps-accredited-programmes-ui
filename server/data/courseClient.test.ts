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

  describe('all', () => {
    beforeEach(() => {
      provider.addInteraction({
        state: 'Server is healthy',
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

  const firstCourse = allCourses[0]

  describe('show', () => {
    beforeEach(() => {
      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request for one course',
        withRequest: {
          method: 'GET',
          path: paths.courses.show({ id: firstCourse.id }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like(firstCourse),
        },
      })
    })

    it('should fetch the given course', async () => {
      const result = await courseClient.find(firstCourse.id)

      expect(result).toEqual(firstCourse)
    })
  })

  const firstCoursesOfferings = courseOfferingFactory.buildList(10)

  describe('offerings', () => {
    beforeEach(() => {
      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: "A request for one course's offerings",
        withRequest: {
          method: 'GET',
          path: paths.courses.offerings({ id: firstCourse.id }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like(firstCoursesOfferings),
        },
      })
    })

    it('should fetch the given course', async () => {
      const result = await courseClient.findOfferings(firstCourse.id)

      expect(result).toEqual(firstCoursesOfferings)
    })
  })
})
