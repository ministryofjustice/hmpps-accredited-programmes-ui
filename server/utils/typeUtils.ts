const assertHasUser: (req: Express.Request) => asserts req is Express.RequestWithUser = req => {
  if (!('user' in req)) {
    throw new Error('Request object without user found unexpectedly')
  }
}

const isNotNull = <T>(argument: T | null): argument is T => {
  return argument !== null
}

export { assertHasUser, isNotNull }
