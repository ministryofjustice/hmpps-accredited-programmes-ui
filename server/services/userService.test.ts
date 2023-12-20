import createError from 'http-errors'

import UserService from './userService'
import logger from '../../logger'
import { HmppsManageUsersClient, PrisonApiClient } from '../data'
import { caseloadFactory, userFactory } from '../testutils/factories'
import { StringUtils } from '../utils'

jest.mock('../data/hmppsManageUsersClient')
jest.mock('../data/prisonApiClient')
jest.mock('../../logger')
jest.mock('../utils')

const systemToken = 'a system token'
const userToken = 'a user token'

describe('UserService', () => {
  const hmppsManageUsersClient = new HmppsManageUsersClient(userToken) as jest.Mocked<HmppsManageUsersClient>
  const hmppsManageUsersClientBuilder = jest.fn()

  const prisonApiClient = new PrisonApiClient(systemToken) as jest.Mocked<PrisonApiClient>
  const prisonApiClientBuilder = jest.fn()

  let userService: UserService

  const username = 'JOHN_SMITH'
  const userFullName = 'john smith'
  const userFullNameCapitalised = 'John Smith'
  const user = userFactory.build({ name: userFullName, username })

  beforeEach(() => {
    jest.resetAllMocks()
    ;(StringUtils.convertToTitleCase as jest.Mock).mockReturnValue(userFullNameCapitalised)
    hmppsManageUsersClientBuilder.mockReturnValue(hmppsManageUsersClient)
    prisonApiClientBuilder.mockReturnValue(prisonApiClient)

    userService = new UserService(hmppsManageUsersClientBuilder, prisonApiClientBuilder)
  })

  describe('getCurrentUserWithDetails', () => {
    beforeEach(() => {
      hmppsManageUsersClient.getCurrentUsername.mockResolvedValue({ username })
      hmppsManageUsersClient.getUserFromUsername.mockResolvedValue(user)
    })

    it('retrieves user and formats name', async () => {
      const result = await userService.getCurrentUserWithDetails(userToken)

      expect(result.displayName).toEqual('John Smith')
    })

    it('fetches caseloads for the current user', async () => {
      const caseloads = [caseloadFactory.active().build(), caseloadFactory.inactive().build()]
      prisonApiClient.findCurrentUserCaseloads.mockResolvedValue(caseloads)

      const result = await userService.getCurrentUserWithDetails(userToken)

      expect(result.caseloads).toEqual(caseloads)
    })

    describe('when the HMPPS Manage Users client throws an error', () => {
      it('propagates the error', async () => {
        hmppsManageUsersClient.getCurrentUsername.mockRejectedValue(new Error('some error'))

        await expect(userService.getCurrentUserWithDetails(userToken)).rejects.toEqual(new Error('some error'))
      })
    })

    describe('when the caseloads client throws an error', () => {
      it("logs the error but sets the user's caseloads to an empty array so the user can still access the service", async () => {
        const caseloadError = new Error('some caseload error')
        prisonApiClient.findCurrentUserCaseloads.mockRejectedValue(caseloadError)

        const result = await userService.getCurrentUserWithDetails(userToken)
        expect(logger.error).toHaveBeenCalledWith(caseloadError, "Failed to fetch user's caseloads")
        expect(result.caseloads).toEqual([])
      })
    })
  })

  describe('getFullNameFromUsername', () => {
    beforeEach(() => {
      hmppsManageUsersClient.getUserFromUsername.mockResolvedValue(user)
    })

    it('returns a username in capitalised form', async () => {
      const result = await userService.getFullNameFromUsername(userToken, username)
      expect(result).toEqual(userFullNameCapitalised)
      expect(StringUtils.convertToTitleCase).toHaveBeenCalledWith(user.name)
      expect(hmppsManageUsersClient.getUserFromUsername).toHaveBeenCalledWith(username)
    })

    it('returns the expected string when missing', async () => {
      const clientError = createError(404)
      hmppsManageUsersClient.getUserFromUsername.mockRejectedValue(clientError)
      const result = await userService.getFullNameFromUsername(userToken, username)
      expect(result).toEqual(`User '${username}' not found`)
      expect(hmppsManageUsersClient.getUserFromUsername).toHaveBeenCalledWith(username)
    })
  })

  describe('getUserFromUsername', () => {
    beforeEach(() => {
      hmppsManageUsersClient.getUserFromUsername.mockResolvedValue(user)
    })

    it('returns the requested user', async () => {
      const result = await userService.getUserFromUsername(userToken, username)

      expect(result).toEqual(user)
      expect(hmppsManageUsersClientBuilder).toHaveBeenCalledWith(userToken)
      expect(hmppsManageUsersClient.getUserFromUsername).toHaveBeenCalledWith(username)
    })

    describe('when the HMPPS Manage Users client throws a 404 error', () => {
      it('re-throws the error', async () => {
        const clientError = createError(404)
        hmppsManageUsersClient.getUserFromUsername.mockRejectedValue(clientError)

        const expectedError = createError(404, `User with username ${username} not found.`)
        await expect(userService.getUserFromUsername(userToken, username)).rejects.toEqual(expectedError)

        expect(hmppsManageUsersClientBuilder).toHaveBeenCalledWith(userToken)
        expect(hmppsManageUsersClient.getUserFromUsername).toHaveBeenCalledWith(username)
      })
    })

    describe('when the HMPPS Manage Users client throws any other error', () => {
      it('re-throws the error', async () => {
        const clientError = createError(500)
        hmppsManageUsersClient.getUserFromUsername.mockRejectedValue(clientError)

        const expectedError = createError(500, `Error fetching user ${username}.`)
        await expect(userService.getUserFromUsername(userToken, username)).rejects.toEqual(expectedError)

        expect(hmppsManageUsersClientBuilder).toHaveBeenCalledWith(userToken)
        expect(hmppsManageUsersClient.getUserFromUsername).toHaveBeenCalledWith(username)
      })
    })
  })
})
