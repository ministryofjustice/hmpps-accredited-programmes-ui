import RestClient from './restClient'
import type { ApiConfig } from '../config'
import config from '../config'
import paths from '../paths/api'
import type { Course, CourseOffering } from '@accredited-programmes/models'

export default class CourseClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('courseClient', config.apis.accreditedProgrammesApi as ApiConfig, token)
  }

  async all(): Promise<Array<Course>> {
    return (await this.restClient.get({ path: paths.courses.index({}) })) as Array<Course>
  }

  async find(id: Course['id']): Promise<Course> {
    return (await this.restClient.get({ path: paths.courses.show({ id }) })) as Course
  }

  async findOfferings(courseId: Course['id']): Promise<Array<CourseOffering>> {
    return (await this.restClient.get({
      path: paths.courses.offerings.index({ id: courseId }),
    })) as Array<CourseOffering>
  }
}
