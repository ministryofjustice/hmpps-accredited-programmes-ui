import createError from 'http-errors'
import type { ResponseError } from 'superagent'

import type UserService from './userService'
import type { CourseClient, HmppsAuthClient, RestClientBuilder, RestClientBuilderWithoutToken } from '../data'
import { CourseParticipationUtils } from '../utils'
import type {
  Audience,
  CourseCreateRequest,
  CourseOffering,
  CourseParticipation,
  CourseParticipationUpdate,
  CoursePrerequisite,
  Person,
} from '@accredited-programmes/models'
import type {
  BuildingChoicesSearchForm,
  GovukFrontendSummaryListWithRowsWithKeysAndValues,
} from '@accredited-programmes/ui'
import type { Course, Referral } from '@accredited-programmes-api'
import type { Prison } from '@prison-register-api'

export default class CourseService {
  constructor(
    private readonly courseClientBuilder: RestClientBuilder<CourseClient>,
    private readonly hmppsAuthClientBuilder: RestClientBuilderWithoutToken<HmppsAuthClient>,
    private readonly userService: UserService,
  ) {}

  async addCourseOffering(
    username: Express.User['username'],
    courseId: Course['id'],
    courseOffering: Omit<CourseOffering, 'id' | 'organisationEnabled'>,
  ): Promise<CourseOffering> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const courseClient = this.courseClientBuilder(systemToken)

    return courseClient.addCourseOffering(courseId, courseOffering)
  }

  async createCourse(username: Express.User['username'], courseCreateRequest: CourseCreateRequest): Promise<Course> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const courseClient = this.courseClientBuilder(systemToken)

    return courseClient.createCourse(courseCreateRequest)
  }

  async createParticipation(
    username: Express.User['username'],
    prisonNumber: CourseParticipation['prisonNumber'],
    courseName: CourseParticipation['courseName'],
  ): Promise<CourseParticipation> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const courseClient = this.courseClientBuilder(systemToken)

    return courseClient.createParticipation(prisonNumber, courseName)
  }

  async deleteOffering(
    username: Express.User['username'],
    courseId: Course['id'],
    courseOfferingId: CourseOffering['id'],
  ): Promise<void> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const courseClient = this.courseClientBuilder(systemToken)

    return courseClient.destroyOffering(courseId, courseOfferingId)
  }

  async deleteParticipation(
    username: Express.User['username'],
    courseParticipationId: CourseParticipation['id'],
  ): Promise<void> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const courseClient = this.courseClientBuilder(systemToken)

    return courseClient.destroyParticipation(courseParticipationId)
  }

  async getAndPresentParticipationsByPerson(
    username: Express.User['username'],
    userToken: Express.User['token'],
    prisonNumber: Person['prisonNumber'],
    referralId: Referral['id'],
    withActions?: {
      change: boolean
      remove: boolean
    },
    headingLevel?: number,
  ): Promise<Array<GovukFrontendSummaryListWithRowsWithKeysAndValues>> {
    const sortedCourseParticipations = (await this.getParticipationsByPerson(username, prisonNumber)).sort(
      (participationA, participationB) => participationA.createdAt.localeCompare(participationB.createdAt),
    )

    return Promise.all(
      sortedCourseParticipations.map(participation =>
        this.presentCourseParticipation(userToken, participation, referralId, headingLevel, withActions),
      ),
    )
  }

  async getBuildingChoicesVariants(
    username: Express.User['username'],
    courseId: Course['id'],
    requestBody: BuildingChoicesSearchForm,
  ): Promise<Array<Course>> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const courseClient = this.courseClientBuilder(systemToken)

    const { isConvictedOfSexualOffence, isInAWomensPrison } = requestBody

    if (isConvictedOfSexualOffence === undefined || isInAWomensPrison === undefined) {
      throw createError(400, 'Values for isConvictedOfSexualOffence and isInAWomensPrison must be provided.')
    }

    return courseClient.findBuildingChoicesVariants(courseId, {
      isConvictedOfSexualOffence: isConvictedOfSexualOffence === 'true',
      isInAWomensPrison: isInAWomensPrison === 'true',
    })
  }

  async getCourse(username: Express.User['username'], courseId: Course['id']): Promise<Course> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const courseClient = this.courseClientBuilder(systemToken)

    return courseClient.find(courseId)
  }

  async getCourseAudiences(username: Express.User['username']): Promise<Array<Audience>> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const courseClient = this.courseClientBuilder(systemToken)

    return courseClient.findCourseAudiences()
  }

  async getCourseByOffering(username: Express.User['username'], courseOfferingId: CourseOffering['id']) {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const courseClient = this.courseClientBuilder(systemToken)

    return courseClient.findCourseByOffering(courseOfferingId)
  }

  async getCourseNames(username: Express.User['username']): Promise<Array<Course['name']>> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const courseClient = this.courseClientBuilder(systemToken)

    return courseClient.findCourseNames()
  }

  async getCourses(username: Express.User['username']): Promise<Array<Course>> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const courseClient = this.courseClientBuilder(systemToken)

    return courseClient.all()
  }

  async getCoursesByOrganisation(
    username: Express.User['username'],
    organisationId: Prison['prisonId'],
  ): Promise<Array<Course>> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const courseClient = this.courseClientBuilder(systemToken)

    return courseClient.findCoursesByOrganisation(organisationId)
  }

  async getOffering(
    username: Express.User['username'],
    courseOfferingId: CourseOffering['id'],
  ): Promise<CourseOffering> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const courseClient = this.courseClientBuilder(systemToken)

    return courseClient.findOffering(courseOfferingId)
  }

  async getOfferingsByCourse(
    username: Express.User['username'],
    courseId: Course['id'],
  ): Promise<Array<CourseOffering>> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const courseClient = this.courseClientBuilder(systemToken)

    return courseClient.findOfferings(courseId)
  }

  async getParticipation(
    username: Express.User['username'],
    courseParticipationId: CourseParticipation['id'],
  ): Promise<CourseParticipation> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const courseClient = this.courseClientBuilder(systemToken)

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
    username: Express.User['username'],
    prisonNumber: Person['prisonNumber'],
  ): Promise<Array<CourseParticipation>> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const courseClient = this.courseClientBuilder(systemToken)

    return courseClient.findParticipationsByPerson(prisonNumber)
  }

  async presentCourseParticipation(
    userToken: Express.User['token'],
    courseParticipation: CourseParticipation,
    referralId: Referral['id'],
    headingLevel?: number,
    withActions = { change: true, remove: true },
  ): Promise<GovukFrontendSummaryListWithRowsWithKeysAndValues> {
    const addedByDisplayName = await this.userService.getFullNameFromUsername(userToken, courseParticipation.addedBy)

    const courseParticipationPresenter = {
      ...courseParticipation,
      addedByDisplayName,
    }

    return CourseParticipationUtils.summaryListOptions(
      courseParticipationPresenter,
      referralId,
      headingLevel,
      withActions,
    )
  }

  async updateCourse(
    username: Express.User['username'],
    courseId: Course['id'],
    courseUpdate: CourseCreateRequest,
  ): Promise<Course> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const courseClient = this.courseClientBuilder(systemToken)

    return courseClient.updateCourse(courseId, courseUpdate)
  }

  async updateCourseOffering(
    username: Express.User['username'],
    courseId: Course['id'],
    courseOffering: Omit<CourseOffering, 'organisationEnabled'>,
  ): Promise<CourseOffering> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const courseClient = this.courseClientBuilder(systemToken)

    return courseClient.updateCourseOffering(courseId, courseOffering)
  }

  async updateCoursePrerequisites(
    username: Express.User['username'],
    courseId: Course['id'],
    prerequisites: Array<CoursePrerequisite>,
  ): Promise<Array<CoursePrerequisite>> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const courseClient = this.courseClientBuilder(systemToken)

    return courseClient.updateCoursePrerequisites(courseId, prerequisites)
  }

  async updateParticipation(
    username: Express.User['username'],
    courseParticipationId: CourseParticipation['id'],
    courseParticipationUpdate: CourseParticipationUpdate,
  ): Promise<CourseParticipation> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const courseClient = this.courseClientBuilder(systemToken)

    return courseClient.updateParticipation(courseParticipationId, courseParticipationUpdate)
  }
}
