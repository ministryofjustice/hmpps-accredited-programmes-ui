import type { SuperAgentRequest } from 'superagent'

import { apiPaths } from '../../server/paths'
import { stubFor } from '../../wiremock'
import type { CourseParticipation, Person } from '@accredited-programmes/models'

export default {
  stubCreateParticipation: (courseParticipation: CourseParticipation): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        url: apiPaths.participations.create({}),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: courseParticipation,
        status: 201,
      },
    }),

  stubDeleteParticipation: (courseParticipationId: CourseParticipation['id']): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'DELETE',
        url: apiPaths.participations.delete({ courseParticipationId }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        status: 200,
      },
    }),

  stubParticipation: (courseParticipation: CourseParticipation): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.participations.show({ courseParticipationId: courseParticipation.id }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: courseParticipation,
        status: 200,
      },
    }),

  stubParticipationsByPerson: (args: {
    courseParticipations: Array<CourseParticipation>
    prisonNumber: Person['prisonNumber']
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.people.participations({ prisonNumber: args.prisonNumber }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.courseParticipations,
        status: 200,
      },
    }),

  stubUpdateParticipation: (courseParticipation: CourseParticipation): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'PUT',
        url: apiPaths.participations.update({ courseParticipationId: courseParticipation.id }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: courseParticipation,
        status: 204,
      },
    }),
}
