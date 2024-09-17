import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import pniAccessMiddleware from './pniAccessMiddleware'
import config from '../config'

describe('pniAccessMiddleware', () => {
  config.flags.pniEnabledOrganisations = ['MDI']

  const requestHandler = jest.fn()
  const res = createMock<Response>({
    locals: {
      user: {
        activeCaseLoadId: 'MDI',
      },
    },
  })
  const req = createMock<Request>({})
  const next = createMock<NextFunction>({})

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('calls the request handler when the users active case load is a PNI enabled organisation', async () => {
    pniAccessMiddleware(requestHandler)(req, res, next)

    expect(requestHandler).toHaveBeenCalled()
  })

  it('redirects to the Auth Error page when the users active case load is not a PNI enabled organisation', async () => {
    res.locals.user.activeCaseLoadId = 'LEI'

    pniAccessMiddleware(requestHandler)(req, res, next)

    expect(requestHandler).not.toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith('/authError')
  })
})
