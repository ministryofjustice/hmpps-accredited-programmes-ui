import type { SuperAgentRequest } from 'superagent'

import { stubFor } from '../../wiremock'
import type { User, UserEmail } from '@manage-users-api'

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

  stubUserDetails: (user: User): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/users/${user.username}`,
      },
      response: {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: user,
        status: 200,
      },
    }),

  stubUserEmail: (userEmail: UserEmail): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/users/${userEmail.username}/email`,
      },
      response: {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          email: userEmail.email,
        },
        status: 200,
      },
    }),
}
