import type { SuperAgentRequest } from 'superagent'

import apiPaths from '../../server/paths/api'
import { stubFor } from '../../wiremock'
import type { Course, CourseOffering } from '@accredited-programmes/models'

export default {
  stubCourse: (course: Course): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.courses.show({ courseId: course.id }),
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
        url: apiPaths.courses.index({}),
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
        url: apiPaths.courses.offerings.index({ courseId: args.courseId }),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.courseOfferings,
      },
    }),

  stubCourseOffering: (args: { courseId: Course['id']; courseOffering: CourseOffering }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.courses.offerings.show({ courseId: args.courseId, courseOfferingId: args.courseOffering.id }),
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.courseOffering,
      },
    }),
}
