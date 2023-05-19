import type { RestClientBuilder } from '../data'
import type CourseClient from '../data/courseClient'
import type { Course } from '@accredited-programmes/models'

export default class CourseService {
  constructor(private readonly courseClientFactory: RestClientBuilder<CourseClient>) {}

  async getCourses(token: string): Promise<Array<Course>> {
    const courseClient = this.courseClientFactory(token)
    return courseClient.all()
  }
}
