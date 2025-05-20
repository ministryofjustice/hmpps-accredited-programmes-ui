import type { SuperAgentRequest } from 'superagent'

import { apiPaths } from '../../server/paths'
import { stubFor } from '../../wiremock'
import type { CourseOffering } from '@accredited-programmes/models'
import type { Audience, Course, PniScore, Referral } from '@accredited-programmes-api'
import type { Prison } from '@prison-register-api'

export default {
  stubBuildingChoicesCourseByReferral: (args: {
    programmePathway: PniScore['programmePathway']
    referralId: Referral['id']
    course?: Course
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        queryParameters: {
          programmePathway: { equalTo: args.programmePathway },
        },
        urlPath: apiPaths.courses.buildingChoicesByReferral({ referralId: args.referralId }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.course,
        status: args.course ? 200 : 404,
      },
    }),

  stubBuildingChoicesCourseVariant: (args: {
    course: Course
    isConvictedOfASexualOffence: string
    isInAWomensPrison: string
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        queryParameters: {
          isConvictedOfASexualOffence: { equalTo: args.isConvictedOfASexualOffence },
          isInAWomensPrison: { equalTo: args.isInAWomensPrison },
        },
        urlPath: apiPaths.courses.buildingChoicesVariants({ courseId: args.course.id }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.course ? [args.course] : [],
        status: 200,
      },
    }),

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

  stubCourseAudiences: (args: { audiences: Array<Audience>; courseId: Course['id'] }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        queryParameters: {
          courseId: { equalTo: args.courseId },
        },
        urlPath: apiPaths.courses.audiences({}),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.audiences,
        status: 200,
      },
    }),

  stubCourseByOffering: (args: { course: Course; courseOfferingId: CourseOffering['id'] }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.offerings.course({ courseOfferingId: args.courseOfferingId }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.course,
        status: 200,
      },
    }),

  stubCourseNames: (courseNames: Array<Course['name']>): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.courses.names({}),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: courseNames,
        status: 200,
      },
    }),

  stubCourses: (courses: Array<Course>): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: apiPaths.courses.index({}),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: courses,
        status: 200,
      },
    }),

  stubCoursesForOrganisation: (args: {
    courses: Array<Course>
    organisationId: Prison['prisonId']
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.organisations.courses({ organisationId: args.organisationId }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.courses,
        status: 200,
      },
    }),

  stubOffering: (args: { courseOffering: CourseOffering }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.offerings.show({ courseOfferingId: args.courseOffering.id }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.courseOffering,
        status: 200,
      },
    }),

  stubOfferingsByCourse: (args: {
    courseId: Course['id']
    courseOfferings: Array<CourseOffering>
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.courses.offerings({ courseId: args.courseId }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.courseOfferings,
        status: 200,
      },
    }),
}
