import UserService from './userService'
import logger from '../../logger'
import { CaseloadClient, HmppsManageUsersClient } from '../data'
import { caseloadFactory } from '../testutils/factories'

jest.mock('../data/hmppsManageUsersClient')
jest.mock('../data/caseloadClient')
jest.mock('../../logger')

const token = 'some token'

describe('UserService', () => {
  const hmppsManageUsersClient = new HmppsManageUsersClient('token') as jest.Mocked<HmppsManageUsersClient>
  const hmppsManageUsersClientBuilder = jest.fn()

  const caseloadClient = new CaseloadClient(token) as jest.Mocked<CaseloadClient>
  const caseloadClientBuilder = jest.fn()

  let userService: UserService

  beforeEach(() => {
    jest.resetAllMocks()

    hmppsManageUsersClientBuilder.mockReturnValue(hmppsManageUsersClient)
    caseloadClientBuilder.mockReturnValue(caseloadClient)

    userService = new UserService(hmppsManageUsersClientBuilder, caseloadClientBuilder)
  })

  describe('getCurrentUserWithDetails', () => {
    const username = 'JOHN_SMITH'
    beforeEach(() => {
      hmppsManageUsersClient.getCurrentUsername.mockResolvedValue({ username })
      hmppsManageUsersClient.getUserFromUsername.mockResolvedValue({
        active: true,
        authSource: 'nomis',
        name: 'john smith',
        userId: 'user-id',
        username,
      })
    })

    it('retrieves user and formats name', async () => {
      const result = await userService.getCurrentUserWithDetails(token)

      expect(result.displayName).toEqual('John Smith')
    })

    it('fetches caseloads for the current user', async () => {
      const caseloads = [caseloadFactory.active().build(), caseloadFactory.inactive().build()]
      caseloadClient.allByCurrentUser.mockResolvedValue(caseloads)

      const result = await userService.getCurrentUserWithDetails(token)

      expect(result.caseloads).toEqual(caseloads)
    })

    describe('when the HMPPS Manage Users client throws an error', () => {
      it('propagates the error', async () => {
        hmppsManageUsersClient.getCurrentUsername.mockRejectedValue(new Error('some error'))

        await expect(userService.getCurrentUserWithDetails(token)).rejects.toEqual(new Error('some error'))
      })
    })

    describe('when the caseloads client throws an error', () => {
      it("logs the error but sets the user's caseloads to an empty array so the user can still access the service", async () => {
        const caseloadError = new Error('some caseload error')
        caseloadClient.allByCurrentUser.mockRejectedValue(caseloadError)

        const result = await userService.getCurrentUserWithDetails(token)
        expect(logger.error).toHaveBeenCalledWith(caseloadError, "Failed to fetch user's caseloads")
        expect(result.caseloads).toEqual([])
      })
    })
  })
})
