import type { RequestWithUser } from '../@types/express'

const assertHasUser: (req: Express.Request) => asserts req is RequestWithUser = req => {
  if (!('user' in req)) {
    throw new Error('Request object without user found unexpectedly')
  }
}

const isNotNull = <T>(argument: T | null): argument is T => {
  return argument !== null
}

const typeUtils: { assertHasUser: typeof assertHasUser; isNotNull: typeof isNotNull } = {
  assertHasUser,
  isNotNull,
}

export default typeUtils
