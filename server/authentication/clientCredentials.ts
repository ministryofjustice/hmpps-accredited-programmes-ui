import config from '../config'

export default class ClientCredentials {
  static generateOauthClientToken(
    clientId: string = config.apis.hmppsAuth.apiClientId,
    clientSecret: string = config.apis.hmppsAuth.apiClientSecret,
  ): string {
    const token = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    return `Basic ${token}`
  }
}
