import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { Request, Response } from 'express'

import authorisationMiddleware from './authorisationMiddleware'
import { UserUtils } from '../utils'

jest.mock('../utils/userUtils')

describe('authorisationMiddleware', () => {
  const next = jest.fn()

  const req: DeepMocked<Request> = createMock<Request>({})
  const res: DeepMocked<Response> = createMock<Response>({
    locals: {
      user: {
        token: 'SOME-TOKEN',
      },
    },
  })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('when there are no required roles', () => {
    it('calls next', () => {
      ;(UserUtils.getUserRolesFromToken as jest.Mock).mockReturnValue([])

      authorisationMiddleware()(req, res, next)

      expect(next).toHaveBeenCalled()
      expect(res.redirect).not.toHaveBeenCalled()
    })
  })

  describe('when user is not authorised with any roles', () => {
    it('redirects to the Auth Error page', () => {
      ;(UserUtils.getUserRolesFromToken as jest.Mock).mockReturnValue([])

      authorisationMiddleware(['SOME_REQUIRED_ROLE'])(req, res, next)

      expect(next).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/authError')
    })
  })

  describe('when user is authorised with required role', () => {
    it('calls next', () => {
      ;(UserUtils.getUserRolesFromToken as jest.Mock).mockReturnValue(['SOME_REQUIRED_ROLE'])

      authorisationMiddleware(['SOME_REQUIRED_ROLE'])(req, res, next)

      expect(next).toHaveBeenCalled()
      expect(res.redirect).not.toHaveBeenCalled()
    })
  })

  describe("when there is no `user` variable set on the response's `locals` object", () => {
    it('redirects to the Sign In page', () => {
      const resWithNoUser: DeepMocked<Response> = createMock<Response>({
        locals: {},
      })

      authorisationMiddleware(['SOME_REQUIRED_ROLE'])(req, resWithNoUser, next)

      expect(next).not.toHaveBeenCalled()
      expect(resWithNoUser.redirect).toHaveBeenCalled()
    })
  })
})
