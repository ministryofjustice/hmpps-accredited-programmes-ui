import type { ApiConfig } from '../../config'
import config from '../../config'
import { apiPaths } from '../../paths'
import RestClient from '../restClient'
import type {
  Audience,
  Course,
  CourseCreateRequest,
  CourseOffering,
  CourseParticipation,
  CourseParticipationUpdate,
  CoursePrerequisite,
  Person,
} from '@accredited-programmes/models'
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
    return (await this.restClient.put({
      data: courseOffering,
      path: apiPaths.offerings.create({ courseId }),
    })) as CourseOffering
  }

  async all(): Promise<Array<Course>> {
    return (await this.restClient.get({ path: apiPaths.courses.index({}) })) as Array<Course>
  }

  async createCourse(courseCreateRequest: CourseCreateRequest): Promise<Course> {
    return (await this.restClient.post({
      data: { ...courseCreateRequest },
      path: apiPaths.courses.create({}),
    })) as Course
  }

  async createParticipation(
    prisonNumber: CourseParticipation['prisonNumber'],
    courseName: CourseParticipation['courseName'],
  ): Promise<CourseParticipation> {
    return (await this.restClient.post({
      data: { courseName, prisonNumber },
      path: apiPaths.participations.create({}),
    })) as CourseParticipation
  }

  async destroyParticipation(courseParticipationId: CourseParticipation['id']): Promise<void> {
    await this.restClient.delete({
      path: apiPaths.participations.delete({ courseParticipationId }),
    })
  }

  async find(courseId: Course['id']): Promise<Course> {
    return (await this.restClient.get({ path: apiPaths.courses.show({ courseId }) })) as Course
  }

  async findCourseAudiences(): Promise<Array<Audience>> {
    return (await this.restClient.get({
      path: apiPaths.courses.audiences({}),
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

  async updateCoursePrerequisites(
    courseId: Course['id'],
    coursePrerequisites: Array<CoursePrerequisite>,
  ): Promise<Array<CoursePrerequisite>> {
    return (await this.restClient.put({
      data: coursePrerequisites,
      path: apiPaths.courses.prerequisites({ courseId }),
    })) as Array<CoursePrerequisite>
  }

  async updateParticipation(
    courseParticipationId: CourseParticipation['id'],
    courseParticipationUpdate: CourseParticipationUpdate,
  ): Promise<CourseParticipation> {
    return (await this.restClient.put({
      data: courseParticipationUpdate,
      path: apiPaths.participations.update({ courseParticipationId }),
    })) as CourseParticipation
  }
}
