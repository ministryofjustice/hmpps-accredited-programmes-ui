import createError from 'http-errors'
import type { ResponseError } from 'superagent'

import type UserService from './userService'
import type { CourseClient, RestClientBuilder } from '../data'
import { CourseParticipationUtils, StringUtils } from '../utils'
import type {
  Course,
  CourseOffering,
  CourseParticipation,
  CourseParticipationUpdate,
  Person,
  Referral,
} from '@accredited-programmes/models'
import type { GovukFrontendSummaryListWithRowsWithValues } from '@accredited-programmes/ui'

export default class CourseService {
  constructor(
    private readonly courseClientBuilder: RestClientBuilder<CourseClient>,
    private readonly userService: UserService,
  ) {}

  async createParticipation(
    token: Express.User['token'],
    prisonNumber: CourseParticipation['prisonNumber'],
    courseName: CourseParticipation['courseName'],
  ): Promise<CourseParticipation> {
    const courseClient = this.courseClientBuilder(token)
    return courseClient.createParticipation(prisonNumber, courseName)
  }

  async deleteParticipation(
    token: Express.User['token'],
    courseParticipationId: CourseParticipation['id'],
  ): Promise<void> {
    const courseClient = this.courseClientBuilder(token)
    return courseClient.destroyParticipation(courseParticipationId)
  }

  async getAndPresentParticipationsByPerson(
    token: Express.User['token'],
    prisonNumber: Person['prisonNumber'],
    referralId: Referral['id'],
    withActions?: {
      change: boolean
      remove: boolean
    },
  ): Promise<Array<GovukFrontendSummaryListWithRowsWithValues>> {
    const sortedCourseParticipations = (await this.getParticipationsByPerson(token, prisonNumber)).sort(
      (participationA, participationB) => participationA.createdAt.localeCompare(participationB.createdAt),
    )

    return Promise.all(
      sortedCourseParticipations.map(participation =>
        this.presentCourseParticipation(token, participation, referralId, withActions),
      ),
    )
  }

  async getCourse(token: Express.User['token'], courseId: Course['id']): Promise<Course> {
    const courseClient = this.courseClientBuilder(token)
    return courseClient.find(courseId)
  }

  async getCourseByOffering(token: Express.User['token'], courseOfferingId: CourseOffering['id']) {
    const courseClient = this.courseClientBuilder(token)
    return courseClient.findCourseByOffering(courseOfferingId)
  }

  async getCourseNames(token: Express.User['token']): Promise<Array<Course['name']>> {
    const courseClient = this.courseClientBuilder(token)
    return courseClient.findCourseNames()
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
  ): Promise<CourseParticipation> {
    const courseClient = this.courseClientBuilder(token)

    try {
      const courseParticipation = await courseClient.findParticipation(courseParticipationId)

      return courseParticipation
    } catch (error) {
      const knownError = error as ResponseError

      if (knownError.status === 404) {
        throw createError(knownError.status, `Course participation with ID ${courseParticipationId} not found.`)
      }

      throw createError(
        knownError.status || 500,
        `Error fetching course participation with ID ${courseParticipationId}.`,
      )
    }
  }

  async getParticipationsByPerson(
    token: Express.User['token'],
    prisonNumber: Person['prisonNumber'],
  ): Promise<Array<CourseParticipation>> {
    const courseClient = this.courseClientBuilder(token)
    return courseClient.findParticipationsByPerson(prisonNumber)
  }

  async presentCourseParticipation(
    token: Express.User['token'],
    courseParticipation: CourseParticipation,
    referralId: Referral['id'],
    withActions = { change: true, remove: true },
  ): Promise<GovukFrontendSummaryListWithRowsWithValues> {
    const addedByUser = await this.userService.getUserFromUsername(token, courseParticipation.addedBy)

    const courseParticipationPresenter = {
      ...courseParticipation,
      addedByDisplayName: StringUtils.convertToTitleCase(addedByUser.name),
    }

    return CourseParticipationUtils.summaryListOptions(courseParticipationPresenter, referralId, withActions)
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
