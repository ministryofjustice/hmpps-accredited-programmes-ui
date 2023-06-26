import { createMock } from '@golevelup/ts-jest'

import UserService from './userService'
import type { User } from '../data/hmppsAuthClient'
import HmppsAuthClient from '../data/hmppsAuthClient'
import type { RedisClient } from '../data/redisClient'
import TokenStore from '../data/tokenStore'

jest.mock('../data/hmppsAuthClient')

const redisClient = createMock<RedisClient>({})
const tokenStore = new TokenStore(redisClient) as jest.Mocked<TokenStore>
const token = 'some token'

describe('UserService', () => {
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let userService: UserService

  describe('getUser', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient(tokenStore) as jest.Mocked<HmppsAuthClient>
      userService = new UserService(hmppsAuthClient)
    })

    it('retrieves user and formats name', async () => {
      hmppsAuthClient.getUser.mockResolvedValue({ name: 'john smith' } as User)

      const result = await userService.getUser(token)

      expect(result.displayName).toEqual('John Smith')
    })

    describe('when the client has an error', () => {
      it('propagates the error', async () => {
        hmppsAuthClient.getUser.mockRejectedValue(new Error('some error'))

        await expect(userService.getUser(token)).rejects.toEqual(new Error('some error'))
      })
    })
  })
})
