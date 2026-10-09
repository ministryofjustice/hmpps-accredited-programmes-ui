import jwt from 'jsonwebtoken'

import UserUtils from './userUtils'

describe('UserUtils', () => {
  function createToken(authorities: Array<string>, claims: Record<string, unknown> = {}) {
    const payload = {
      auth_source: 'nomis',
      authorities,
      client_id: 'clientid',
      jti: 'a610a10-cca6-41db-985f-e87efb303aaf',
      scope: ['read', 'write'],
      user_name: 'USER1',
      ...claims,
    }

    return jwt.sign(payload, 'secret', { expiresIn: '1h' })
  }

  describe('getRolesFromToken', () => {
    it('decodes the roles from the user token', () => {
      expect(UserUtils.getUserRolesFromToken(createToken(['SOME_REQUIRED_ROLE']))).toEqual(['SOME_REQUIRED_ROLE'])
    })
  })

  describe('getUserUuidFromToken', () => {
    it('decodes the user UUID from the user token', () => {
      const token = createToken([], { user_uuid: '11111111-1111-1111-1111-111111111111' })

      expect(UserUtils.getUserUuidFromToken(token)).toEqual('11111111-1111-1111-1111-111111111111')
    })

    it('returns undefined when the user token has no user UUID', () => {
      expect(UserUtils.getUserUuidFromToken(createToken([]))).toBeUndefined()
    })
  })
})
