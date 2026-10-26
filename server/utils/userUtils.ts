import { jwtDecode } from 'jwt-decode'

export default class UserUtils {
  static getUserRolesFromToken(userToken: Express.User['token']): Array<string> | undefined {
    return (jwtDecode(userToken) as { authorities?: Array<string> }).authorities
  }

  // This is a UUID created by HMPPS Auth upon first user login that is unique to the user across all auth sources
  static getUserUuidFromToken(userToken: Express.User['token']): string | undefined {
    return (jwtDecode(userToken) as { user_uuid?: string }).user_uuid
  }
}
