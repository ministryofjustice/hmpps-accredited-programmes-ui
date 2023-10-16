import type { SuperAgentRequest } from 'superagent'

import { stubFor } from '../../wiremock'
import type { User } from '@accredited-programmes/users'

export default {
  stubCurrentUser: (username: User['username']): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/users/me',
      },
      response: {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          username,
        },
        status: 200,
      },
    }),

  stubUserDetails: (args: { name: User['name']; username: User['username'] }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/users/${args.username}`,
      },
      response: {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          active: true,
          authSource: 'auth',
          name: args.name,
          userId: '1234',
          username: args.username,
        },
        status: 200,
      },
    }),
}
