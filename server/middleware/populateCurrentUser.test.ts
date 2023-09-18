import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { Request, Response } from 'express'

import populateCurrentUser from './populateCurrentUser'
import logger from '../../logger'
import type { UserService } from '../services'
import type { UserDetails } from '../services/userService'
import { UserUtils } from '../utils'

jest.mock('../utils/userUtils')
jest.mock('../../logger')

describe('populateCurrentUser', () => {
  const userService = createMock<UserService>({})

  const next = jest.fn()

  const req: DeepMocked<Request> = createMock<Request>({})

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('when the user variable is set', () => {
    const res: DeepMocked<Response> = createMock<Response>({
      locals: {
        user: {
          token: 'SOME-TOKEN',
        },
      },
    })

    describe('and they are found by the user service', () => {
      it('populates the user with its token, details from the userService and its roles, then calls next', async () => {
        userService.getUser.mockResolvedValue({
          displayName: 'DEL_HATTON',
          name: 'Del Hatton',
          userId: 'random-uuid',
        })
        ;(UserUtils.getUserRolesFromToken as jest.Mock).mockReturnValue(['SOME_REQUIRED_ROLE'])

        await populateCurrentUser(userService)(req, res, next)

        expect(res.locals.user).toEqual({
          displayName: 'DEL_HATTON',
          name: 'Del Hatton',
          roles: ['SOME_REQUIRED_ROLE'],
          token: 'SOME-TOKEN',
          userId: 'random-uuid',
        })

        expect(next).toHaveBeenCalled()
      })
    })

    describe('and they are not found by the user service', () => {
      it('logs that no user was found and calls next', async () => {
        userService.getUser.mockResolvedValue(null as unknown as UserDetails)
        ;(UserUtils.getUserRolesFromToken as jest.Mock).mockReturnValue(['SOME_REQUIRED_ROLE'])

        await populateCurrentUser(userService)(req, res, next)

        expect(logger.info).toHaveBeenCalledWith('No user available')

        expect(next).toHaveBeenCalled()
      })
    })
  })

  describe('when there is no user', () => {
    const res: DeepMocked<Response> = createMock<Response>({
      locals: {},
    })

    it('calls next', async () => {
      await populateCurrentUser(userService)(req, res, next)

      expect(next).toHaveBeenCalled()
    })
  })

  describe('when the user service throws an error', () => {
    it('logs the error and calls next', async () => {
      const res: DeepMocked<Response> = createMock<Response>({
        locals: {
          user: {
            token: 'SOME-TOKEN',
            username: 'MY_USERNAME',
          },
        },
      })
      const error = new Error('error message')

      userService.getUser.mockRejectedValue(error)
      await populateCurrentUser(userService)(req, res, next)

      expect(logger.error).toBeCalledWith(error, `Failed to retrieve user for: MY_USERNAME`)
      expect(next).toHaveBeenCalled()
    })
  })
})