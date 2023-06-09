import type { SuperAgentRequest } from 'superagent'

import paths from '../../server/paths/api'
import { stubFor } from '../../wiremock'
import type { Course, CourseOffering } from '@accredited-programmes/models'

export default {
  stubCourse: (course: Course): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: paths.courses.show({ id: course.id }),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: course,
      },
    }),

  stubCourses: (courses: Array<Course>): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: paths.courses.index({}),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: courses,
      },
    }),

  stubCourseOfferings: (args: { courseId: Course['id']; courseOfferings: Array<CourseOffering> }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: paths.courses.offerings.index({ id: args.courseId }),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.courseOfferings,
      },
    }),
}
