import type { ApiConfig } from '../../config'
import config from '../../config'
import { apiPaths } from '../../paths'
import RestClient from '../restClient'
import type { CourseCreateRequest, CourseOffering, CoursePrerequisite, Person } from '@accredited-programmes/models'
import type {
  Audience,
  BuildingChoicesSearchRequest,
  Course,
  CourseParticipation,
  CourseParticipationCreate,
  CourseParticipationUpdate,
} from '@accredited-programmes-api'
import type { SystemToken } from '@hmpps-auth'

export default class CourseClient {
  restClient: RestClient

  constructor(systemToken: SystemToken) {
    this.restClient = new RestClient('courseClient', config.apis.accreditedProgrammesApi as ApiConfig, systemToken)
  }

  /* istanbul ignore next */
  async addCourseOffering(
    courseId: Course['id'],
    courseOffering: Omit<CourseOffering, 'id' | 'organisationEnabled'>,
  ): Promise<CourseOffering> {
    return (await this.restClient.post({
      data: courseOffering,
      path: apiPaths.offerings.create({ courseId }),
    })) as CourseOffering
  }

  async all(query?: { intensity?: 'HIGH' | 'MODERATE' }): Promise<Array<Course>> {
    return (await this.restClient.get({
      path: apiPaths.courses.index({}),
      query: {
        ...(query?.intensity && { intensity: query.intensity }),
      },
    })) as Array<Course>
  }

  async createCourse(courseCreateRequest: CourseCreateRequest): Promise<Course> {
    return (await this.restClient.post({
      data: { ...courseCreateRequest },
      path: apiPaths.courses.create({}),
    })) as Course
  }

  async createParticipation(participationCreateRequest: CourseParticipationCreate): Promise<CourseParticipation> {
    return (await this.restClient.post({
      data: { ...participationCreateRequest },
      path: apiPaths.participations.create({}),
    })) as CourseParticipation
  }

  /* istanbul ignore next */
  async destroyOffering(courseId: Course['id'], courseOfferingId: CourseOffering['id']): Promise<void> {
    await this.restClient.delete({
      path: apiPaths.courses.offering({ courseId, courseOfferingId }),
    })
  }

  async destroyParticipation(courseParticipationId: CourseParticipation['id']): Promise<void> {
    await this.restClient.delete({
      path: apiPaths.participations.delete({ courseParticipationId }),
    })
  }

  async find(courseId: Course['id']): Promise<Course> {
    return (await this.restClient.get({ path: apiPaths.courses.show({ courseId }) })) as Course
  }

  /* istanbul ignore next */
  async findBuildingChoicesVariants(
    courseId: Course['id'],
    requestBody: BuildingChoicesSearchRequest,
  ): Promise<Array<Course>> {
    return (await this.restClient.post({
      data: { ...requestBody },
      path: apiPaths.courses.buildingChoices({ courseId }),
    })) as Array<Course>
  }

  async findCourseAudiences(query?: { courseId: Course['id'] }): Promise<Array<Audience>> {
    return (await this.restClient.get({
      path: apiPaths.courses.audiences({}),
      query: {
        ...(query?.courseId && { courseId: query.courseId }),
      },
    })) as Array<Audience>
  }

  async findCourseByOffering(courseOfferingId: CourseOffering['id']): Promise<Course> {
    return (await this.restClient.get({
      path: apiPaths.offerings.course({ courseOfferingId }),
    })) as Course
  }

  async findCourseNames(): Promise<Array<Course['name']>> {
    return (await this.restClient.get({
      path: apiPaths.courses.names({}),
    })) as Array<Course['name']>
  }

  async findCoursesByOrganisation(organisationId: string): Promise<Array<Course>> {
    return (await this.restClient.get({
      path: apiPaths.organisations.courses({ organisationId }),
    })) as Array<Course>
  }

  async findOffering(courseOfferingId: CourseOffering['id']): Promise<CourseOffering> {
    return (await this.restClient.get({
      path: apiPaths.offerings.show({ courseOfferingId }),
    })) as CourseOffering
  }

  async findOfferings(courseId: Course['id']): Promise<Array<CourseOffering>> {
    return (await this.restClient.get({
      path: apiPaths.courses.offerings({ courseId }),
    })) as Array<CourseOffering>
  }

  async findParticipation(courseParticipationId: CourseParticipation['id']): Promise<CourseParticipation> {
    return (await this.restClient.get({
      path: apiPaths.participations.show({ courseParticipationId }),
    })) as CourseParticipation
  }

  async findParticipationsByPerson(prisonNumber: Person['prisonNumber']): Promise<Array<CourseParticipation>> {
    return (await this.restClient.get({
      path: apiPaths.people.participations({ prisonNumber }),
    })) as Array<CourseParticipation>
  }

  /* istanbul ignore next */
  async findParticipationsByReferral(referralId: string): Promise<Array<CourseParticipation>> {
    return (await this.restClient.get({
      path: apiPaths.participations.referral({ referralId }),
    })) as Array<CourseParticipation>
  }

  /* istanbul ignore next */
  async updateCourse(courseId: Course['id'], courseUpdate: CourseCreateRequest): Promise<Course> {
    return (await this.restClient.put({
      data: { ...courseUpdate },
      path: apiPaths.courses.update({ courseId }),
    })) as Course
  }

  /* istanbul ignore next */
  async updateCourseOffering(
    courseId: Course['id'],
    courseOffering: Omit<CourseOffering, 'organisationEnabled'>,
  ): Promise<CourseOffering> {
    return (await this.restClient.put({
      data: courseOffering,
      path: apiPaths.offerings.update({ courseId }),
    })) as CourseOffering
  }

  /* istanbul ignore next */
  async updateCoursePrerequisites(
    courseId: Course['id'],
    coursePrerequisites: Array<CoursePrerequisite>,
  ): Promise<Array<CoursePrerequisite>> {
    return (await this.restClient.put({
      data: { prerequisites: coursePrerequisites },
      path: apiPaths.courses.prerequisites({ courseId }),
    })) as Array<CoursePrerequisite>
  }

  async updateParticipation(
    courseParticipationId: CourseParticipation['id'],
    courseParticipationUpdate: CourseParticipationUpdate,
  ): Promise<CourseParticipation> {
    return (await this.restClient.put({
      data: { ...courseParticipationUpdate },
      path: apiPaths.participations.update({ courseParticipationId }),
    })) as CourseParticipation
  }
}
