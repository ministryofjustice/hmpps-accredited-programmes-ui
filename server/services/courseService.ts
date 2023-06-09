import type { RestClientBuilder } from '../data'
import type CourseClient from '../data/courseClient'
import type { Course, CourseOffering } from '@accredited-programmes/models'

export default class CourseService {
  constructor(private readonly courseClientFactory: RestClientBuilder<CourseClient>) {}

  async getCourses(token: string): Promise<Array<Course>> {
    const courseClient = this.courseClientFactory(token)
    return courseClient.all()
  }

  async getCourse(token: string, courseId: Course['id']): Promise<Course> {
    const courseClient = this.courseClientFactory(token)
    return courseClient.find(courseId)
  }

  async getOfferingsByCourse(token: string, courseId: Course['id']): Promise<Array<CourseOffering>> {
    const courseClient = this.courseClientFactory(token)
    return courseClient.findOfferings(courseId)
  }

  async getOffering(
    token: string,
    courseId: Course['id'],
    courseOfferingId: CourseOffering['id'],
  ): Promise<CourseOffering> {
    const courseClient = this.courseClientFactory(token)
    return courseClient.findOffering(courseId, courseOfferingId)
  }
}
