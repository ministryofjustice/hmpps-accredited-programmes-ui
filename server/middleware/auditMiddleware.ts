import type { NextFunction, Request, RequestHandler, Response } from 'express'

import logger from '../../logger'
import type AuditService from '../services/auditService'

const wrapHandler =
  (handler: RequestHandler, auditService: AuditService, auditEvent: string | undefined) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const username = res?.locals?.user?.username
    if (!username) {
      logger.error('User without a username is attempting to access an audited path')
      res.redirect('/authError')
      return
    }

    await handler(req, res, next)

    if (auditEvent) {
      await auditService.sendAuditMessage(auditEvent, username, req.params)
    }
  }

export default function auditMiddleware(
  handler: RequestHandler,
  auditService: AuditService,
  auditEventSpec?: AuditEventSpec,
): RequestHandler {
  if (auditEventSpec) {
    return wrapHandler(handler, auditService, auditEventSpec?.auditEvent)
  }

  return handler
}

export type AuditEventSpec = {
  auditEvent?: string
}
