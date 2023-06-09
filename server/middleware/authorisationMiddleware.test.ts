import type { Request, Response } from 'express'
import jwt from 'jsonwebtoken'

import authorisationMiddleware from './authorisationMiddleware'

function createToken(authorities: string[]) {
  const payload = {
    user_name: 'USER1',
    scope: ['read', 'write'],
    auth_source: 'nomis',
    authorities,
    jti: 'a610a10-cca6-41db-985f-e87efb303aaf',
    client_id: 'clientid',
  }

  return jwt.sign(payload, 'secret', { expiresIn: '1h' })
}

describe('authorisationMiddleware', () => {
  let req: Request
  const next = jest.fn()

  function createResWithToken({ authorities }: { authorities: string[] }): Response {
    return {
      locals: {
        user: {
          token: createToken(authorities),
        },
      },
      redirect: jest.fn(),
    } as unknown as Response
  }

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('when there are no required roles', () => {
    it('calls next', async () => {
      const res = createResWithToken({ authorities: [] })

      await authorisationMiddleware()(req, res, next)

      expect(next).toHaveBeenCalled()
      expect(res.redirect).not.toHaveBeenCalled()
    })
  })

  describe('when user is not authorised with any roles', () => {
    it('redirects', async () => {
      const res = createResWithToken({ authorities: [] })

      await authorisationMiddleware(['SOME_REQUIRED_ROLE'])(req, res, next)

      expect(next).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/authError')
    })
  })

  describe('when user is authorised with required role', () => {
    it('calls next', async () => {
      const res = createResWithToken({ authorities: ['SOME_REQUIRED_ROLE'] })

      await authorisationMiddleware(['SOME_REQUIRED_ROLE'])(req, res, next)

      expect(next).toHaveBeenCalled()
      expect(res.redirect).not.toHaveBeenCalled()
    })
  })
})
