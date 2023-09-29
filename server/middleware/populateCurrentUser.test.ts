import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { Request, Response } from 'express'

import populateCurrentUser from './populateCurrentUser'
import logger from '../../logger'
import type { UserService } from '../services'
import { UserUtils } from '../utils'
import type { UserDetails } from '@accredited-programmes/users'

jest.mock('../utils/userUtils')
jest.mock('../../logger')

describe('populateCurrentUser', () => {
  const userService = createMock<UserService>({})

  const next = jest.fn()

  let req: DeepMocked<Request>

  beforeEach(() => {
    jest.resetAllMocks()

    req = createMock<Request>({
      session: {
        user: undefined,
      },
    })
  })

  describe('when the user variable is set', () => {
    const res: DeepMocked<Response> = createMock<Response>({
      locals: {
        user: {
          token: 'SOME-TOKEN',
        },
      },
    })

    describe('and the user is not already present in the session', () => {
      describe('and they are found by the user service', () => {
        it('populates the user with its token, details from the user service and its roles, then calls next', async () => {
          userService.getUser.mockResolvedValue({
            displayName: 'DEL_HATTON',
            name: 'Del Hatton',
            userId: 'random-uuid',
          })
          ;(UserUtils.getUserRolesFromToken as jest.Mock).mockReturnValue(['SOME_REQUIRED_ROLE'])

          await populateCurrentUser(userService)(req, res, next)

          expect(userService.getUser).toHaveBeenCalledWith('SOME-TOKEN')

          expect(res.locals.user).toEqual({
            displayName: 'DEL_HATTON',
            hasReferrerRole: false,
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

    describe('and the user is already present in the session', () => {
      it('does not make a new request to the user service', async () => {
        req = createMock<Request>({
          session: {
            user: {
              displayName: 'DEL_HATTON',
              hasReferrerRole: false,
              name: 'Del Hatton',
              roles: ['SOME_REQUIRED_ROLE'],
              token: 'SOME-TOKEN',
              userId: 'random-uuid',
            } as UserDetails,
          },
        })
        ;(UserUtils.getUserRolesFromToken as jest.Mock).mockReturnValue(['SOME_REQUIRED_ROLE'])

        await populateCurrentUser(userService)(req, res, next)

        expect(userService.getUser).not.toHaveBeenCalled()

        expect(next).toHaveBeenCalled()
      })
    })

    describe('and they have the `ROLE_ACP_REFERRER` role', () => {
      it('sets the `hasReferrerRole` property to true', async () => {
        userService.getUser.mockResolvedValue({
          displayName: 'DEL_HATTON',
          name: 'Del Hatton',
          userId: 'random-uuid',
        })
        ;(UserUtils.getUserRolesFromToken as jest.Mock).mockReturnValue(['ROLE_ACP_REFERRER'])

        await populateCurrentUser(userService)(req, res, next)

        expect(res.locals.user).toEqual(
          expect.objectContaining({
            hasReferrerRole: true,
            roles: ['ROLE_ACP_REFERRER'],
          }),
        )
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
