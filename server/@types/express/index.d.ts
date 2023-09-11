import type { Request as ConnectFlashRequest } from '@types/connect-flash'

declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    nowInMinutes: number
    returnTo: string
  }
}

declare module 'express' {
  interface TypedRequestHandler<T, U = Response> extends Express.RequestHandler {
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

export { global }

export type { RequestWithUser }

export default {}
