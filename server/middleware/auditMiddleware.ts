import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { type Key, pathToRegexp } from 'path-to-regexp'

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

const matchAuditEvent = (
  path: string,
  redirectMatcher: RedirectAuditMatcher,
  redirectParams: Record<string, string>,
) => {
  const matches = redirectMatcher.regExp.exec(path)

  if (matches) {
    redirectMatcher.keys.forEach((key, i) => {
      const param = key.name
      // eslint-disable-next-line no-param-reassign
      redirectParams[param] = decodeURIComponent(matches[i + 1])
    })

    return true
  }
  return false
}

const wrapHandler =
  (
    handler: RequestHandler,
    auditService: AuditService,
    auditEvent: string | undefined,
    auditBodyParams: Array<string> | undefined,
    redirectMatchers: Array<RedirectAuditMatcher> | undefined,
  ) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let redirectAuditEvent: string | undefined
    let redirectParams: Record<string, string> = {}

    const username = res?.locals?.user?.username
    if (!username) {
      logger.error('User without a username is attempting to access an audited path')
      res.redirect('/authError')
      return
    }

    await handler(req, res, next)

    const encodedRedirectLocation = res.get('Location')
    if (encodedRedirectLocation && redirectMatchers) {
      const redirectPath = decodeURI(encodedRedirectLocation)
      redirectParams = {}

      redirectMatchers.some(redirectMatcher => {
        if (matchAuditEvent(redirectPath, redirectMatcher, redirectParams)) {
          redirectAuditEvent = redirectMatcher.auditEvent
          return true
        }
        return false
      })
    }

    if (auditEvent) {
      await auditService.sendAuditMessage(auditEvent, username, auditDetails(req, auditBodyParams))
    }

    if (redirectAuditEvent) {
      await auditService.sendAuditMessage(redirectAuditEvent, username, redirectParams)
    }
  }

type RedirectAuditEventSpec = { auditEvent: string; path: string }
type RedirectAuditMatcher = { auditEvent: string; keys: Array<Key>; regExp: RegExp }

export default function auditMiddleware(
  handler: RequestHandler,
  auditService: AuditService,
  auditEventSpec?: AuditEventSpec,
): RequestHandler {
  if (auditEventSpec) {
    const redirectMatchers: Array<RedirectAuditMatcher> | undefined = auditEventSpec.redirectAuditEventSpecs?.map(
      ({ path, auditEvent: redirectAuditEvent }) => {
        const keys: Array<Key> = []
        return { auditEvent: redirectAuditEvent, keys, regExp: pathToRegexp(path, keys) }
      },
    )

    return wrapHandler(
      handler,
      auditService,
      auditEventSpec?.auditEvent,
      auditEventSpec?.auditBodyParams,
      redirectMatchers,
    )
  }

  return handler
}

export type AuditEventSpec = {
  auditBodyParams?: Array<string>
  auditEvent?: string
  redirectAuditEventSpecs?: Array<RedirectAuditEventSpec>
}
