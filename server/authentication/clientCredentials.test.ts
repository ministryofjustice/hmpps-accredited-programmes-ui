import clientCredentials from './clientCredentials'

describe('clientCredentials', () => {
  describe('generateOauthClientToken', () => {
    it('generates a token', () => {
      expect(clientCredentials.generateOauthClientToken('bob', 'password1')).toBe('Basic Ym9iOnBhc3N3b3JkMQ==')
    })

    it('generates a token with special characters when provided', () => {
      const value = clientCredentials.generateOauthClientToken('bob', "p@'s&sw/o$+ rd1")
      const decoded = Buffer.from(value.substring(6), 'base64').toString('utf-8')

      expect(decoded).toBe("bob:p@'s&sw/o$+ rd1")
    })
  })
})
