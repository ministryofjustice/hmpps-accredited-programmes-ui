import { CourseClient } from '../data'
import type { Course, CourseOffering } from '@accredited-programmes/models'

export default class CourseService {
  courseClient: CourseClient

  constructor(token: string) {
    this.courseClient = new CourseClient(token)
  }

  async getCourses(): Promise<Array<Course>> {
    return this.courseClient.all()
  }

  async getCourse(id: Course['id']): Promise<Course> {
    return this.courseClient.find(id)
  }

  async getOfferingsByCourse(id: Course['id']): Promise<Array<CourseOffering>> {
    return this.courseClient.findOfferings(id)
  }

  async getOffering(courseId: Course['id'], courseOfferingId: CourseOffering['id']): Promise<CourseOffering> {
    return this.courseClient.findOffering(courseId, courseOfferingId)
  }
}
