import { createMock } from '@golevelup/ts-jest'
import type { Request, Response } from 'express'
import { path } from 'static-path'

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

  describe('body parameters', () => {
    it('includes selected request body parameters with the audit message', async () => {
      const handler = jest.fn()
      const response = createMock<Response>({ locals: { user: { username } } })
      const request = createMock<Request>({
        body: { bodyParam1: 'body-value-1', bodyParam2: 'body-value-2', bodyParam3: 'body-value-3' },
        params: requestParams,
      })
      const next = jest.fn()

      const auditService = createMock<AuditService>()

      const auditedhandler = auditMiddleware(handler, auditService, {
        auditBodyParams: ['bodyParam1', 'bodyParam2'],
        auditEvent,
      })

      await auditedhandler(request, response, next)

      expect(handler).toHaveBeenCalled()
      expect(auditService.sendAuditMessage).toHaveBeenCalledWith(auditEvent, username, {
        ...requestParams,
        bodyParam1: 'body-value-1',
        bodyParam2: 'body-value-2',
      })
    })

    it('ignores empty request body parameters', async () => {
      const handler = jest.fn()
      const response = createMock<Response>({ locals: { user: { username } } })
      const request = createMock<Request>({
        body: { bodyParam1: 'body-value-1', bodyParam2: '' },
        params: requestParams,
      })
      const next = jest.fn()

      const auditService = createMock<AuditService>()

      const auditedhandler = auditMiddleware(handler, auditService, {
        auditBodyParams: ['bodyParam1', 'bodyParam2'],
        auditEvent,
      })

      await auditedhandler(request, response, next)

      expect(handler).toHaveBeenCalled()
      expect(auditService.sendAuditMessage).toHaveBeenCalledWith(auditEvent, username, {
        ...requestParams,
        bodyParam1: 'body-value-1',
      })
    })
  })

  describe('redirectAuditSpecs', () => {
    const programmeHistoryPathPrefix = path('/referrals').path(':referralId').path('programme-history')

    it('sends an audit message based on the redirect destination of the given request handler', async () => {
      const somePath = programmeHistoryPathPrefix.path(':courseParticipationId').path('details')

      const handler = jest.fn()
      const response = createMock<Response>({
        get: field => {
          return field === 'Location'
            ? somePath({ courseParticipationId: 'my-course-participation-uuid', referralId: 'my-referral-uuid' })
            : undefined
        },
        locals: { user: { username } },
      })
      const request = createMock<Request>()
      const next = jest.fn()

      const auditService = createMock<AuditService>()

      const auditedhandler = auditMiddleware(handler, auditService, {
        redirectAuditEventSpecs: [{ auditEvent, path: somePath.pattern }],
      })

      await auditedhandler(request, response, next)

      expect(handler).toHaveBeenCalled()
      expect(auditService.sendAuditMessage).toHaveBeenCalledWith(auditEvent, username, {
        courseParticipationId: 'my-course-participation-uuid',
        referralId: 'my-referral-uuid',
      })
    })

    it('sends an audit message only for the first matching RedirectAuditEventSpec', async () => {
      const nonMatchingPath = path('/').path('some-path-component')
      const matchingPath1 = programmeHistoryPathPrefix.path('new')
      const matchingPath2 = programmeHistoryPathPrefix.path(':courseParticipationId')

      const handler = jest.fn()
      const response = createMock<Response>({
        get: field => {
          return field === 'Location' ? matchingPath1({ referralId: 'my-referral-uuid' }) : undefined
        },
        locals: { user: { username } },
      })
      const request = createMock<Request>()
      const next = jest.fn()

      const auditService = createMock<AuditService>()

      const auditedhandler = auditMiddleware(handler, auditService, {
        redirectAuditEventSpecs: [
          { auditEvent: 'NON_MATCHING_PATH_AUDIT_EVENT', path: nonMatchingPath.pattern },
          { auditEvent: 'MATCHING_PATH_1_AUDIT_EVENT', path: matchingPath1.pattern },
          { auditEvent: 'MATCHING_PATH_2_AUDIT_EVENT', path: matchingPath2.pattern },
        ],
      })

      await auditedhandler(request, response, next)

      expect(handler).toHaveBeenCalled()
      expect(auditService.sendAuditMessage).toHaveBeenCalledWith('MATCHING_PATH_1_AUDIT_EVENT', username, {
        referralId: 'my-referral-uuid',
      })
    })

    it('sends the default message if the path does not match', async () => {
      const nonMatchingPath = path('/').path('some-path-component')
      const matchingPath1 = programmeHistoryPathPrefix.path('new')
      const matchingPath2 = programmeHistoryPathPrefix.path(':courseParticipationId')

      const handler = jest.fn()
      const response = createMock<Response>({
        get: field => {
          return field === 'Location' ? nonMatchingPath.pattern : undefined
        },
        locals: { user: { username } },
      })
      const request = createMock<Request>({ params: requestParams })
      const next = jest.fn()

      const auditService = createMock<AuditService>()

      const auditedhandler = auditMiddleware(handler, auditService, {
        auditEvent: 'DEFAULT_AUDIT_EVENT',
        redirectAuditEventSpecs: [
          { auditEvent: 'MATCHING_PATH_1_AUDIT_EVENT', path: matchingPath1.pattern },
          { auditEvent: 'MATCHING_PATH_2_AUDIT_EVENT', path: matchingPath2.pattern },
        ],
      })

      await auditedhandler(request, response, next)

      expect(handler).toHaveBeenCalled()
      expect(auditService.sendAuditMessage).toHaveBeenCalled()
      expect(auditService.sendAuditMessage).toHaveBeenCalledWith('DEFAULT_AUDIT_EVENT', username, requestParams)
    })
  })
})
