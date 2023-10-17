import type { NextFunction, Request, RequestHandler, Response } from 'express'

import logger from '../../logger'
import type AuditService from '../services/auditService'

const auditDetails = (req: Request, auditBodyParams: Array<string> | undefined) => {
  if (!auditBodyParams) {
    return req.params
  }

  return {
    ...req.params,
    ...auditBodyParams.reduce(
      (previous, current) => (req.body[current] ? { [current]: req.body[current], ...previous } : previous),
      {},
    ),
  }
}

const wrapHandler =
  (
    handler: RequestHandler,
    auditService: AuditService,
    auditEvent: string | undefined,
    auditBodyParams: Array<string> | undefined,
  ) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const username = res?.locals?.user?.username
    if (!username) {
      logger.error('User without a username is attempting to access an audited path')
      res.redirect('/authError')
      return
    }

    await handler(req, res, next)

    if (auditEvent) {
      await auditService.sendAuditMessage(auditEvent, username, auditDetails(req, auditBodyParams))
    }
  }

export default function auditMiddleware(
  handler: RequestHandler,
  auditService: AuditService,
  auditEventSpec?: AuditEventSpec,
): RequestHandler {
  if (auditEventSpec) {
    return wrapHandler(handler, auditService, auditEventSpec?.auditEvent, auditEventSpec?.auditBodyParams)
  }

  return handler
}

export type AuditEventSpec = {
  auditBodyParams?: Array<string>
  auditEvent?: string
}
