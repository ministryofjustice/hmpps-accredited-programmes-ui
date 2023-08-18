import type { SuperAgentRequest } from 'superagent'

import { apiPaths } from '../../server/paths'
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
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: course,
        status: 200,
      },
    }),

  stubCourseByOffering: (args: { course: Course; courseOfferingId: CourseOffering['id'] }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.courses.offerings.course({ courseOfferingId: args.courseOfferingId }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.course,
        status: 200,
      },
    }),

  stubCourseOffering: (args: { courseId: Course['id']; courseOffering: CourseOffering }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.courses.offerings.show({ courseId: args.courseId, courseOfferingId: args.courseOffering.id }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.courseOffering,
        status: 200,
      },
    }),

  stubCourseOfferings: (args: { courseId: Course['id']; courseOfferings: Array<CourseOffering> }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.courses.offerings.index({ courseId: args.courseId }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.courseOfferings,
        status: 200,
      },
    }),

  stubCourses: (courses: Array<Course>): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.courses.index({}),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: courses,
        status: 200,
      },
    }),
}
