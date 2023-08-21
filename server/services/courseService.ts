import type { CourseClient, RestClientBuilder } from '../data'
import type { Course, CourseOffering } from '@accredited-programmes/models'

export default class CourseService {
  constructor(private readonly courseClientBuilder: RestClientBuilder<CourseClient>) {}

  async getCourse(token: Express.User['token'], courseId: Course['id']): Promise<Course> {
    const courseClient = this.courseClientBuilder(token)
    return courseClient.find(courseId)
  }

  async getCourseByOffering(token: Express.User['token'], courseOfferingId: CourseOffering['id']) {
    const courseClient = this.courseClientBuilder(token)
    return courseClient.findCourseByOffering(courseOfferingId)
  }

  async getCourses(token: Express.User['token']): Promise<Array<Course>> {
    const courseClient = this.courseClientBuilder(token)
    return courseClient.all()
  }

  async getOffering(
    token: Express.User['token'],
    courseId: Course['id'],
    courseOfferingId: CourseOffering['id'],
  ): Promise<CourseOffering> {
    const courseClient = this.courseClientBuilder(token)
    return courseClient.findOffering(courseId, courseOfferingId)
  }

  async getOfferingsByCourse(token: Express.User['token'], courseId: Course['id']): Promise<Array<CourseOffering>> {
    const courseClient = this.courseClientBuilder(token)
    return courseClient.findOfferings(courseId)
  }
}
