import { jwtDecode } from 'jwt-decode'

export default class UserUtils {
  static getUserRolesFromToken(userToken: Express.User['token']): Array<string> | undefined {
    return (jwtDecode(userToken) as { authorities?: Array<string> }).authorities
  }
}
