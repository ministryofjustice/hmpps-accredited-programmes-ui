import RestClient from './restClient'
import type { ApiConfig } from '../config'
import config from '../config'
import apiPaths from '../paths/api'
import type { Course, CourseOffering } from '@accredited-programmes/models'

export default class CourseClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('courseClient', config.apis.accreditedProgrammesApi as ApiConfig, token)
  }

  async all(): Promise<Array<Course>> {
    return (await this.restClient.get({ path: apiPaths.courses.index({}) })) as Array<Course>
  }

  async find(courseId: Course['id']): Promise<Course> {
    return (await this.restClient.get({ path: apiPaths.courses.show({ courseId }) })) as Course
  }

  async findOfferings(courseId: Course['id']): Promise<Array<CourseOffering>> {
    return (await this.restClient.get({
      path: apiPaths.courses.offerings.index({ courseId }),
    })) as Array<CourseOffering>
  }

  async findOffering(courseId: Course['id'], courseOfferingId: CourseOffering['id']): Promise<CourseOffering> {
    return (await this.restClient.get({
      path: apiPaths.courses.offerings.show({ courseId, courseOfferingId }),
    })) as CourseOffering
  }
}
