import jwt from 'jsonwebtoken'

import MiddlewareUtils from './middlewareUtils'

describe('MiddlewareUtils', () => {
  function createToken(authorities: Array<string>) {
    const payload = {
      auth_source: 'nomis',
      authorities,
      client_id: 'clientid',
      jti: 'a610a10-cca6-41db-985f-e87efb303aaf',
      scope: ['read', 'write'],
      user_name: 'USER1',
    }

    return jwt.sign(payload, 'secret', { expiresIn: '1h' })
  }

  describe('getRolesFromToken', () => {
    it('decodes the roles from the user token', () => {
      expect(MiddlewareUtils.getUserRolesFromToken(createToken(['SOME_REQUIRED_ROLE']))).toEqual(['SOME_REQUIRED_ROLE'])
    })
  })
})
