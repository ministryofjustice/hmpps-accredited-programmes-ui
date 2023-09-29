import RestClient from './restClient'
import type { ApiConfig } from '../config'
import config from '../config'
import { apiPaths } from '../paths'
import type {
  Course,
  CourseOffering,
  CourseParticipation,
  CourseParticipationUpdate,
  Person,
} from '@accredited-programmes/models'

export default class CourseClient {
  restClient: RestClient

  constructor(token: Express.User['token']) {
    this.restClient = new RestClient('courseClient', config.apis.accreditedProgrammesApi as ApiConfig, token)
  }

  async all(): Promise<Array<Course>> {
    return (await this.restClient.get({ path: apiPaths.courses.index({}) })) as Array<Course>
  }

  async createParticipation(
    prisonNumber: CourseParticipation['prisonNumber'],
    courseId?: CourseParticipation['id'],
    otherCourseName?: CourseParticipation['otherCourseName'],
  ): Promise<CourseParticipation> {
    return (await this.restClient.post({
      data: { courseId, otherCourseName, prisonNumber },
      path: apiPaths.participations.create({}),
    })) as CourseParticipation
  }

  async find(courseId: Course['id']): Promise<Course> {
    return (await this.restClient.get({ path: apiPaths.courses.show({ courseId }) })) as Course
  }

  async findCourseByOffering(courseOfferingId: CourseOffering['id']): Promise<Course> {
    return (await this.restClient.get({
      path: apiPaths.offerings.course({ courseOfferingId }),
    })) as Course
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
