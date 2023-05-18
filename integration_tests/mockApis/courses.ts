import type { SuperAgentRequest } from 'superagent'

import paths from '../../server/paths/api'
import { stubFor } from '../../wiremock'
import type { Course } from '@accredited-programmes/models'

export default {
  stubCourses: (courses: Array<Course>): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: paths.courses.index,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: courses,
      },
    }),
}
