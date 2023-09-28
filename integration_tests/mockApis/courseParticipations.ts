import type { SuperAgentRequest } from 'superagent'

import { apiPaths } from '../../server/paths'
import { stubFor } from '../../wiremock'
import type { CourseParticipation, Person } from '@accredited-programmes/models'

export default {
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
}
