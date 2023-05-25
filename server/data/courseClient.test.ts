import { Matchers } from '@pact-foundation/pact'
import { pactWith } from 'jest-pact'

import CourseClient from './courseClient'
import config from '../config'
import paths from '../paths/api'
import courseFactory from '../testutils/factories/course'

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

    it('should fetch all programmes', async () => {
      const result = await courseClient.all()

      expect(result).toEqual(allCourses)
    })
  })
})
