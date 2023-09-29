import createError from 'http-errors'
import type { ResponseError } from 'superagent'

import type { CourseClient, RestClientBuilder } from '../data'
import type {
  Course,
  CourseOffering,
  CourseParticipation,
  CourseParticipationUpdate,
  Person,
} from '@accredited-programmes/models'

export default class CourseService {
  constructor(private readonly courseClientBuilder: RestClientBuilder<CourseClient>) {}

  async createParticipation(
    token: Express.User['token'],
    prisonNumber: CourseParticipation['prisonNumber'],
    courseId?: CourseParticipation['id'],
    otherCourseName?: CourseParticipation['otherCourseName'],
  ): Promise<CourseParticipation> {
    const courseClient = this.courseClientBuilder(token)
    return courseClient.createParticipation(prisonNumber, courseId, otherCourseName)
  }

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

  async getOffering(token: Express.User['token'], courseOfferingId: CourseOffering['id']): Promise<CourseOffering> {
    const courseClient = this.courseClientBuilder(token)
    return courseClient.findOffering(courseOfferingId)
  }

  async getOfferingsByCourse(token: Express.User['token'], courseId: Course['id']): Promise<Array<CourseOffering>> {
    const courseClient = this.courseClientBuilder(token)
    return courseClient.findOfferings(courseId)
  }

  async getParticipation(
    token: Express.User['token'],
    courseParticipationId: CourseParticipation['id'],
  ): Promise<CourseParticipation | null> {
    const courseClient = this.courseClientBuilder(token)

    try {
      const courseParticipation = await courseClient.findParticipation(courseParticipationId)

      return courseParticipation
    } catch (error) {
      const knownError = error as ResponseError

      if (knownError.status === 404) {
        return null
      }

      throw createError(knownError.status || 500, knownError, {
        userMessage: `Error fetching course participation with ID ${courseParticipationId}.`,
      })
    }
  }

  async getParticipationsByPerson(
    token: Express.User['token'],
    prisonNumber: Person['prisonNumber'],
  ): Promise<Array<CourseParticipation>> {
    const courseClient = this.courseClientBuilder(token)
    return courseClient.findParticipationsByPerson(prisonNumber)
  }

  async updateParticipation(
    token: Express.User['token'],
    courseParticipationId: CourseParticipation['id'],
    courseParticipationUpdate: CourseParticipationUpdate,
  ): Promise<CourseParticipation> {
    const courseClient = this.courseClientBuilder(token)
    return courseClient.updateParticipation(courseParticipationId, courseParticipationUpdate)
  }
}
