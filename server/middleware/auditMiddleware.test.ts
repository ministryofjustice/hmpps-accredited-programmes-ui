import { createMock } from '@golevelup/ts-jest'
import type { Request, Response } from 'express'

import auditMiddleware from './auditMiddleware'
import logger from '../../logger'
import type AuditService from '../services/auditService'

jest.mock('../../logger')

const username = 'username'
const requestParams = { param1: 'value-1', param2: 'value-2' }
const auditEvent = 'SOME_AUDIT_EVENT'

describe('auditMiddleware', () => {
  it('returns the given request handler when no audit events are specified', async () => {
    const handler = jest.fn()

    const auditService = createMock<AuditService>()

    const auditedhandler = auditMiddleware(handler, auditService)

    expect(auditedhandler).toEqual(handler)
  })

  it('returns an audited request handler, that forwards the call on to the given request handler', async () => {
    const handler = jest.fn()
    const response = createMock<Response>({ locals: { user: { username } } })
    const request = createMock<Request>()
    const next = jest.fn()

    const auditService = createMock<AuditService>()

    const auditedhandler = auditMiddleware(handler, auditService, { auditEvent })

    await auditedhandler(request, response, next)

    expect(handler).toHaveBeenCalled()
  })

  it('returns an audited request handler, that sends an audit message including the request parameters', async () => {
    const handler = jest.fn()
    const response = createMock<Response>({ locals: { user: { username } } })
    const request = createMock<Request>({ params: requestParams })
    const next = jest.fn()

    const auditService = createMock<AuditService>()

    const auditedhandler = auditMiddleware(handler, auditService, { auditEvent })

    await auditedhandler(request, response, next)

    expect(handler).toHaveBeenCalled()
    expect(auditService.sendAuditMessage).toHaveBeenCalledWith(auditEvent, username, requestParams)
  })

  describe('when there is no username', () => {
    const response = createMock<Response>({ locals: { user: {} } })

    it('returns an audited request handler and redirects to /authError', async () => {
      const handler = jest.fn()
      const request = createMock<Request>()
      const next = jest.fn()

      const auditService = createMock<AuditService>()

      const auditedhandler = auditMiddleware(handler, auditService, { auditEvent })

      await auditedhandler(request, response, next)

      expect(handler).not.toHaveBeenCalled()
      expect(response.redirect).toHaveBeenCalledWith('/authError')
      expect(logger.error).toHaveBeenCalledWith('User without a username is attempting to access an audited path')
    })
  })
})
