import RestClient from './restClient'
import type { ApiConfig } from '../config'
import config from '../config'
import paths from '../paths/api'
import type { Course } from '@accredited-programmes/models'

export default class CourseClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('courseClient', config.apis.accreditedProgrammesApi as ApiConfig, token)
  }

  async all(): Promise<Array<Course>> {
    return (await this.restClient.get({ path: paths.courses.index({}) })) as Array<Course>
  }
}
