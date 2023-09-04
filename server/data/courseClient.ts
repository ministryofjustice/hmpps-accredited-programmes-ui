import RestClient from './restClient'
import type { ApiConfig } from '../config'
import config from '../config'
import { apiPaths } from '../paths'
import type { Course, CourseOffering } from '@accredited-programmes/models'

export default class CourseClient {
  restClient: RestClient

  constructor(token: Express.User['token']) {
    this.restClient = new RestClient('courseClient', config.apis.accreditedProgrammesApi as ApiConfig, token)
  }

  async all(): Promise<Array<Course>> {
    return (await this.restClient.get({ path: apiPaths.courses.index({}) })) as Array<Course>
  }

  async find(courseId: Course['id']): Promise<Course> {
    return (await this.restClient.get({ path: apiPaths.courses.show({ courseId }) })) as Course
  }

  async findCourseByOffering(courseOfferingId: CourseOffering['id']): Promise<Course> {
    return (await this.restClient.get({
      path: apiPaths.courses.offerings.course({ courseOfferingId }),
    })) as Course
  }

  async findOffering(courseOfferingId: CourseOffering['id']): Promise<CourseOffering> {
    return (await this.restClient.get({
      path: apiPaths.courses.offerings.show({ courseOfferingId }),
    })) as CourseOffering
  }

  async findOfferings(courseId: Course['id']): Promise<Array<CourseOffering>> {
    return (await this.restClient.get({
      path: apiPaths.courses.offerings.index({ courseId }),
    })) as Array<CourseOffering>
  }
}
