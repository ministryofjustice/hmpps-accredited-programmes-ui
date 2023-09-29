// to fix later = seems that some of the TypeScript here isn't entirely valid, but we don't have time to work out how to rewrite this now
// @ts-expect-error to fix later: https://github.com/microsoft/TypeScript/issues/16472
import type { Request as ConnectFlashRequest } from '@types/connect-flash'

import type { UserDetails } from '../users'

declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    nowInMinutes: number
    returnTo: string
    user: UserDetails
  }
}

declare module 'express' {
  interface TypedRequestHandler<T, U = Response> extends RequestHandler {
    (req: T, res: U, next: () => void): void
  }
}

declare global {
  namespace Express {
    interface User {
      authSource: string
      token: string
      userId: string
      username: string
    }

    interface Request extends ConnectFlashRequest {
      id: string // eslint-disable-next-line @typescript-eslint/member-ordering
      logout(done: (err: unknown) => void): void
      verified?: boolean
    }

    type RequestWithUser = Request & { user: Express.User }
  }
}

type RequestWithUser = Express.RequestWithUser

// @ts-expect-error to fix later
export { global }

export type { RequestWithUser }

// @ts-expect-error to fix later
export default {}
