import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { Request, Response } from 'express'

import type { ApplicationRoles } from './roleBasedAccessMiddleware'
import roleBasedAccessMiddleware from './roleBasedAccessMiddleware'
import logger from '../../logger'

jest.mock('../../logger')

describe('roleBasedAccessMiddleware', () => {
  let req: DeepMocked<Request>
  let res: DeepMocked<Response>
  let next: jest.Mock
  let handler: jest.Mock

  beforeEach(() => {
    req = createMock<Request>({})
    res = createMock<Response>({
      locals: {
        user: {
          roles: ['SOME_ROLE'],
        },
      },
    })
    next = jest.fn()
    handler = jest.fn()
  })

  it('returns the request handler if no allowed roles are specified', async () => {
    const anotherHandler = roleBasedAccessMiddleware(handler, {})

    await anotherHandler(req, res, next)

    expect(handler).toHaveBeenCalledWith(req, res, next)
  })

  it('returns the request handler if an allowed role is specified', async () => {
    const anotherHandler = roleBasedAccessMiddleware(handler, { allowedRoles: ['SOME_ROLE' as ApplicationRoles] })

    await anotherHandler(req, res, next)

    expect(handler).toHaveBeenCalledWith(req, res, next)
  })

  it('redirects to the auth error page if the user does not have an allowed role', async () => {
    const anotherHandler = roleBasedAccessMiddleware(handler, { allowedRoles: ['SOME_OTHER_ROLE' as ApplicationRoles] })

    await anotherHandler(req, res, next)

    expect(handler).not.toHaveBeenCalled()
    expect(logger.error).toHaveBeenCalledWith('User is not authorised to access this')
    expect(res.redirect).toHaveBeenCalledWith('/authError')
  })
})
