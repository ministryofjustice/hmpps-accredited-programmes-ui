import jwt from 'jsonwebtoken'
import type { Response } from 'superagent'

import tokenVerification from './tokenVerification'
import { getMatchingRequests, stubFor } from '../../wiremock'

const mockedUsername = () => {
  return 'USER1'
}

const createToken = () => {
  const payload = {
    auth_source: 'nomis',
    authorities: [],
    client_id: 'clientid',
    jti: '83b50a10-cca6-41db-985f-e87efb303ddb',
    scope: ['read'],
    user_name: mockedUsername(),
  }

  return jwt.sign(payload, 'secret', { expiresIn: '1h' })
}

const getSignInUrl = (): Promise<string> =>
  getMatchingRequests({
    method: 'GET',
    urlPath: '/auth/oauth/authorize',
  }).then(data => {
    const { requests } = data.body
    const stateValue = requests[requests.length - 1].queryParams.state.values[0]
    return `/sign-in/callback?code=codexxxx&state=${stateValue}`
  })

const favicon = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/favicon.ico',
    },
    response: {
      status: 200,
    },
  })

const ping = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/health/ping',
    },
    response: {
      status: 200,
    },
  })

const redirect = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/oauth/authorize\\?response_type=code&redirect_uri=.+?&state=.+?&client_id=clientid',
    },
    response: {
      body: '<html><body>SignIn page<h1 class="govuk-heading-l">Sign in</h1></body></html>',
      headers: {
        'Content-Type': 'text/html',
        Location: 'http://localhost:3007/sign-in/callback?code=codexxxx&state=stateyyyy',
      },
      status: 200,
    },
  })

const signOut = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/sign-out.*',
    },
    response: {
      body: '<html><body>SignIn page<h1 class="govuk-heading-l">Sign in</h1></body></html>',
      headers: {
        'Content-Type': 'text/html',
      },
      status: 200,
    },
  })

const manageDetails = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/account-details.*',
    },
    response: {
      body: '<html><body><h1 class="govuk-heading-l">Your account details</h1></body></html>',
      headers: {
        'Content-Type': 'text/html',
      },
      status: 200,
    },
  })

const token = () =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/auth/oauth/token',
    },
    response: {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        Location: 'http://localhost:3007/sign-in/callback?code=codexxxx&state=stateyyyy',
      },
      jsonBody: {
        access_token: createToken(),
        expires_in: 599,
        internalUser: true,
        scope: 'read',
        token_type: 'bearer',
        user_name: mockedUsername(),
      },
      status: 200,
    },
  })

const stubUser = (name: string) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/api/user/me',
    },
    response: {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        active: true,
        name,
        staffId: 231232,
        username: mockedUsername(),
      },
      status: 200,
    },
  })

const stubUserRoles = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/api/user/me/roles',
    },
    response: {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: [{ roleCode: 'SOME_USER_ROLE' }],
      status: 200,
    },
  })

export default {
  getSignInUrl,
  mockedUsername,
  stubAuthPing: ping,
  stubAuthUser: (name = 'john smith'): Promise<[Response, Response]> => Promise.all([stubUser(name), stubUserRoles()]),
  stubSignIn: (): Promise<[Response, Response, Response, Response, Response, Response]> =>
    Promise.all([favicon(), redirect(), signOut(), manageDetails(), token(), tokenVerification.stubVerifyToken()]),
}
