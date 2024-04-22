import nock from 'nock'

import HmppsManageUsersClient from './hmppsManageUsersClient'
import config from '../config'
import type { User, UserEmail } from '@manage-users-api'

jest.mock('./tokenStore')

const userToken = 'token-1'

describe('HmppsManageUsersClient', () => {
  let fakeManageUsersApiUrl: nock.Scope
  let hmppsManageUsersClient: HmppsManageUsersClient

  beforeEach(() => {
    fakeManageUsersApiUrl = nock(config.apis.hmppsManageUsers.url)
    hmppsManageUsersClient = new HmppsManageUsersClient(userToken)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('getCurrentUsername', () => {
    it("should return the logged-in user's username from the API", async () => {
      const response: Pick<User, 'username'> = { username: 'DEL_HATTON' }

      fakeManageUsersApiUrl.get('/users/me').matchHeader('authorization', `Bearer ${userToken}`).reply(200, response)

      const output = await hmppsManageUsersClient.getCurrentUsername()
      expect(output).toEqual(response)
    })
  })

  describe('getEmailFromUsername', () => {
    it('should return the email address of the user from the API', async () => {
      const username = 'BOB_SMITH'
      const response: UserEmail = {
        email: 'bob.smith@test-email.co.uk',
        username,
        verified: true,
      }

      fakeManageUsersApiUrl
        .get(`/users/${username}/email`)
        .matchHeader('authorization', `Bearer ${userToken}`)
        .reply(200, response)

      const output = await hmppsManageUsersClient.getEmailFromUsername(username)
      expect(output).toEqual(response)
    })
  })

  describe('getUserFromUsername', () => {
    it('should return the user from the API', async () => {
      const response: User = {
        active: true,
        authSource: 'nomis',
        name: 'John Smith',
        userId: 'user-id',
        username: 'JOHN_SMITH',
      }

      fakeManageUsersApiUrl
        .get('/users/JOHN_SMITH')
        .matchHeader('authorization', `Bearer ${userToken}`)
        .reply(200, response)

      const output = await hmppsManageUsersClient.getUserFromUsername('JOHN_SMITH')
      expect(output).toEqual(response)
    })
  })
})
