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
import type { GovukFrontendSummaryListWithRowsWithKeysAndValues } from '@accredited-programmes/ui'

export default class CourseService {
  constructor(
    private readonly courseClientBuilder: RestClientBuilder<CourseClient>,
    private readonly userService: UserService,
  ) {}

  async createParticipation(
    userToken: Express.User['token'],
    prisonNumber: CourseParticipation['prisonNumber'],
    courseName: CourseParticipation['courseName'],
  ): Promise<CourseParticipation> {
    const courseClient = this.courseClientBuilder(userToken)
    return courseClient.createParticipation(prisonNumber, courseName)
  }

  async deleteParticipation(
    userToken: Express.User['token'],
    courseParticipationId: CourseParticipation['id'],
  ): Promise<void> {
    const courseClient = this.courseClientBuilder(userToken)
    return courseClient.destroyParticipation(courseParticipationId)
  }

  async getAndPresentParticipationsByPerson(
    userToken: Express.User['token'],
    prisonNumber: Person['prisonNumber'],
    referralId: Referral['id'],
    withActions?: {
      change: boolean
      remove: boolean
    },
  ): Promise<Array<GovukFrontendSummaryListWithRowsWithKeysAndValues>> {
    const sortedCourseParticipations = (await this.getParticipationsByPerson(userToken, prisonNumber)).sort(
      (participationA, participationB) => participationA.createdAt.localeCompare(participationB.createdAt),
    )

    return Promise.all(
      sortedCourseParticipations.map(participation =>
        this.presentCourseParticipation(userToken, participation, referralId, withActions),
      ),
    )
  }

  async getCourse(userToken: Express.User['token'], courseId: Course['id']): Promise<Course> {
    const courseClient = this.courseClientBuilder(userToken)
    return courseClient.find(courseId)
  }

  async getCourseByOffering(userToken: Express.User['token'], courseOfferingId: CourseOffering['id']) {
    const courseClient = this.courseClientBuilder(userToken)
    return courseClient.findCourseByOffering(courseOfferingId)
  }

  async getCourseNames(userToken: Express.User['token']): Promise<Array<Course['name']>> {
    const courseClient = this.courseClientBuilder(userToken)
    return courseClient.findCourseNames()
  }

  async getCourses(userToken: Express.User['token']): Promise<Array<Course>> {
    const courseClient = this.courseClientBuilder(userToken)
    return courseClient.all()
  }

  async getOffering(userToken: Express.User['token'], courseOfferingId: CourseOffering['id']): Promise<CourseOffering> {
    const courseClient = this.courseClientBuilder(userToken)
    return courseClient.findOffering(courseOfferingId)
  }

  async getOfferingsByCourse(userToken: Express.User['token'], courseId: Course['id']): Promise<Array<CourseOffering>> {
    const courseClient = this.courseClientBuilder(userToken)
    return courseClient.findOfferings(courseId)
  }

  async getParticipation(
    userToken: Express.User['token'],
    courseParticipationId: CourseParticipation['id'],
  ): Promise<CourseParticipation> {
    const courseClient = this.courseClientBuilder(userToken)

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
    userToken: Express.User['token'],
    prisonNumber: Person['prisonNumber'],
  ): Promise<Array<CourseParticipation>> {
    const courseClient = this.courseClientBuilder(userToken)
    return courseClient.findParticipationsByPerson(prisonNumber)
  }

  async presentCourseParticipation(
    userToken: Express.User['token'],
    courseParticipation: CourseParticipation,
    referralId: Referral['id'],
    withActions = { change: true, remove: true },
  ): Promise<GovukFrontendSummaryListWithRowsWithKeysAndValues> {
    const addedByUser = await this.userService.getUserFromUsername(userToken, courseParticipation.addedBy)

    const courseParticipationPresenter = {
      ...courseParticipation,
      addedByDisplayName: StringUtils.convertToTitleCase(addedByUser.name),
    }

    return CourseParticipationUtils.summaryListOptions(courseParticipationPresenter, referralId, withActions)
  }

  async updateParticipation(
    userToken: Express.User['token'],
    courseParticipationId: CourseParticipation['id'],
    courseParticipationUpdate: CourseParticipationUpdate,
  ): Promise<CourseParticipation> {
    const courseClient = this.courseClientBuilder(userToken)
    return courseClient.updateParticipation(courseParticipationId, courseParticipationUpdate)
  }
}
