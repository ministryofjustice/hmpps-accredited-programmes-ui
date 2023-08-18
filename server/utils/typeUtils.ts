import type { RequestWithUser } from '../@types/express'

export default class TypeUtils {
  static assertHasUser(req: Express.Request): asserts req is RequestWithUser {
    if (!('user' in req)) {
      throw new Error('Request object without user found unexpectedly')
    }
  }

  static isNotNull<T>(argument: T | null): argument is T {
    return argument !== null
  }
}
