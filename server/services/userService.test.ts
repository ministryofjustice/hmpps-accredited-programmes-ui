import createError from 'http-errors'

import UserService from './userService'
import logger from '../../logger'
import { CaseloadClient, HmppsManageUsersClient } from '../data'
import { caseloadFactory } from '../testutils/factories'
import type { User } from '@accredited-programmes/users'

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

  const username = 'JOHN_SMITH'
  const userResponse: User = {
    active: true,
    authSource: 'nomis',
    name: 'john smith',
    userId: 'user-id',
    username,
  }

  beforeEach(() => {
    jest.resetAllMocks()

    hmppsManageUsersClientBuilder.mockReturnValue(hmppsManageUsersClient)
    caseloadClientBuilder.mockReturnValue(caseloadClient)

    userService = new UserService(hmppsManageUsersClientBuilder, caseloadClientBuilder)
  })

  describe('getCurrentUserWithDetails', () => {
    beforeEach(() => {
      hmppsManageUsersClient.getCurrentUsername.mockResolvedValue({ username })
      hmppsManageUsersClient.getUserFromUsername.mockResolvedValue(userResponse)
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

  describe('getUserFromUsername', () => {
    beforeEach(() => {
      hmppsManageUsersClient.getUserFromUsername.mockResolvedValue(userResponse)
    })

    it('returns the requested user', async () => {
      const result = await userService.getUserFromUsername(token, username)

      expect(result).toEqual(userResponse)
      expect(hmppsManageUsersClientBuilder).toHaveBeenCalledWith(token)
      expect(hmppsManageUsersClient.getUserFromUsername).toHaveBeenCalledWith(username)
    })

    describe('when the HMPPS Manage Users client throws a 404 error', () => {
      it('re-throws the error', async () => {
        const clientError = createError(404)
        hmppsManageUsersClient.getUserFromUsername.mockRejectedValue(clientError)

        const expectedError = createError(404, `User with username ${username} not found.`)
        await expect(userService.getUserFromUsername(token, username)).rejects.toEqual(expectedError)

        expect(hmppsManageUsersClientBuilder).toHaveBeenCalledWith(token)
        expect(hmppsManageUsersClient.getUserFromUsername).toHaveBeenCalledWith(username)
      })
    })

    describe('when the HMPPS Manage Users client throws any other error', () => {
      it('re-throws the error', async () => {
        const clientError = createError(500)
        hmppsManageUsersClient.getUserFromUsername.mockRejectedValue(clientError)

        const expectedError = createError(500, `Error fetching user ${username}.`)
        await expect(userService.getUserFromUsername(token, username)).rejects.toEqual(expectedError)

        expect(hmppsManageUsersClientBuilder).toHaveBeenCalledWith(token)
        expect(hmppsManageUsersClient.getUserFromUsername).toHaveBeenCalledWith(username)
      })
    })
  })
})
