import type { RestClientBuilder } from '../data'
import type CourseClient from '../data/courseClient'
import type { Course, CourseOffering } from '@accredited-programmes/models'

export default class CourseService {
  constructor(private readonly courseClientBuilder: RestClientBuilder<CourseClient>) {}

  async getCourses(token: string): Promise<Array<Course>> {
    const courseClient = this.courseClientBuilder(token)
    return courseClient.all()
  }

  async getCourse(token: string, id: Course['id']): Promise<Course> {
    const courseClient = this.courseClientBuilder(token)
    return courseClient.find(id)
  }

  async getOfferingsByCourse(token: string, id: Course['id']): Promise<Array<CourseOffering>> {
    const courseClient = this.courseClientBuilder(token)
    return courseClient.findOfferings(id)
  }

  async getOffering(
    token: string,
    courseId: Course['id'],
    courseOfferingId: CourseOffering['id'],
  ): Promise<CourseOffering> {
    const courseClient = this.courseClientBuilder(token)
    return courseClient.findOffering(courseId, courseOfferingId)
  }
}
