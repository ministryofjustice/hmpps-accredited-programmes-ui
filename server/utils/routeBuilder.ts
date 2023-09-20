import type { RequestHandler, Router } from 'express'
import express from 'express'

import type Role from '../authentication/role'
import asyncMiddleware from '../middleware/asyncMiddleware'
import authorisationMiddleware from '../middleware/authorisationMiddleware'

export default class Routes {
  static forAnyRole(): Routes {
    return new Routes(express.Router(), [])
  }

  static forRole(role: Role): Routes {
    return new Routes(express.Router(), [role])
  }

  private constructor(
    private readonly router: Router,
    private readonly authorisedRoles: Array<Role>,
  ) {}

  public build(): Router {
    return this.router
  }

  public forRole(role: Role): Routes {
    return new Routes(this.router, [role])
  }

  get(path: string, ...handlers: Array<RequestHandler>): Routes {
    this.router.get(path, authorisationMiddleware(this.authorisedRoles), this.wrap(handlers))
    return this
  }

  post(path: string, ...handlers: Array<RequestHandler>): Routes {
    this.router.post(path, authorisationMiddleware(this.authorisedRoles), this.wrap(handlers))
    return this
  }

  put(path: string, ...handlers: Array<RequestHandler>): Routes {
    this.router.put(path, authorisationMiddleware(this.authorisedRoles), this.wrap(handlers))
    return this
  }

  use(otherRouter: Router): Routes {
    this.router.use(otherRouter)
    return this
  }

  private wrap = (handlers: Array<RequestHandler>) => handlers.map(handler => asyncMiddleware(handler))
}
