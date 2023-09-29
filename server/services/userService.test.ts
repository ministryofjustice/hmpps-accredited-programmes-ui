import { createMock } from '@golevelup/ts-jest'

import UserService from './userService'
import logger from '../../logger'
import type { RedisClient, User } from '../data'
import { CaseloadClient, HmppsAuthClient, TokenStore } from '../data'
import { caseloadFactory } from '../testutils/factories'

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/caseloadClient')
jest.mock('../../logger')

const redisClient = createMock<RedisClient>({})
const tokenStore = new TokenStore(redisClient) as jest.Mocked<TokenStore>
const token = 'some token'

describe('UserService', () => {
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  const hmppsAuthClientBuilder = jest.fn()
  let caseloadClient: jest.Mocked<CaseloadClient>
  const caseloadClientBuilder = jest.fn()
  let userService: UserService

  describe('getUser', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient(tokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAuthClientBuilder.mockReturnValue(hmppsAuthClient)
      caseloadClient = new CaseloadClient(token) as jest.Mocked<CaseloadClient>
      caseloadClientBuilder.mockReturnValue(caseloadClient)
      userService = new UserService(hmppsAuthClientBuilder, caseloadClientBuilder)
    })

    it('retrieves user and formats name', async () => {
      hmppsAuthClient.getUser.mockResolvedValue({ name: 'john smith' } as User)

      const result = await userService.getUser(token)

      expect(result.displayName).toEqual('John Smith')
    })

    it('fetches caseloads for the current user', async () => {
      hmppsAuthClient.getUser.mockResolvedValue({ name: 'john smith' } as User)

      const caseloads = [caseloadFactory.active().build(), caseloadFactory.inactive().build()]
      caseloadClient.allByCurrentUser.mockResolvedValue(caseloads)

      const result = await userService.getUser(token)

      expect(result.caseloads).toEqual(caseloads)
    })

    describe('when the HMPPS Auth client throws an error', () => {
      it('propagates the error', async () => {
        hmppsAuthClient.getUser.mockRejectedValue(new Error('some error'))

        await expect(userService.getUser(token)).rejects.toEqual(new Error('some error'))
      })
    })

    describe('when the caseloads client throws an error', () => {
      it("logs the error but sets the user's caseloads to an empty array so the user can still access the service", async () => {
        hmppsAuthClient.getUser.mockResolvedValue({ name: 'john smith' } as User)

        const caseloadError = new Error('some caseload error')

        caseloadClient.allByCurrentUser.mockRejectedValue(caseloadError)

        const result = await userService.getUser(token)
        expect(logger.error).toHaveBeenCalledWith(caseloadError, "Failed to fetch user's caseloads")
        expect(result.caseloads).toEqual([])
      })
    })
  })
})
