import jwtDecode from 'jwt-decode'

export default class MiddlewareUtils {
  static getUserRolesFromToken = (token: Express.User['token']): Array<string> | undefined => {
    return (jwtDecode(token) as { authorities?: Array<string> }).authorities
  }
}
