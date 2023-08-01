import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import setUpCookies from './setUpCookies'

describe('setUpCookies', () => {
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('setting the `returnTo` url', () => {
    describe('when not posting to the `/cookie-preferences` route', () => {
      const request: DeepMocked<Request> = createMock<Request>({
        url: 'my-url',
        originalUrl: 'original-url',
      })

      it('stores the original url for redirecting back to', () => {
        setUpCookies()(request, response, next)

        expect(request.session.returnTo).toEqual('original-url')
        expect(response.locals.returnTo).toEqual('original-url')
      })
    })

    describe('when posting to the `/cookie-preferences` route', () => {
      const request: DeepMocked<Request> = createMock<Request>({
        url: '/cookie-preferences',
      })

      it('does not set the `returnTo` url value', () => {
        setUpCookies()(request, response, next)

        expect(request.session.returnTo).toBeUndefined()
        expect(response.locals.returnTo).toBeUndefined()
      })
    })
  })

  describe('setting the value of `analyticsCookiesPreference`', () => {
    describe('when `acceptAnalyticsCookies` is undefined', () => {
      it('sets the value to `rejected` by default', () => {
        const request: DeepMocked<Request> = createMock<Request>({
          // Interestingly, an empty request isn't picked up by router.use
          url: 'my-url',
        })

        setUpCookies()(request, response, next)

        expect(response.locals.analyticsCookiesPreference).toEqual('rejected')
      })
    })

    describe('when `acceptAnalyticsCookies` is `"true"`', () => {
      it('sets the value to `accepted`', () => {
        const request: DeepMocked<Request> = createMock<Request>({
          url: 'my-url',
          cookies: {
            acceptAnalyticsCookies: 'true',
          },
        })

        setUpCookies()(request, response, next)

        expect(response.locals.analyticsCookiesPreference).toEqual('accepted')
      })
    })

    describe('when `acceptAnalyticsCookies` is `"false"`', () => {
      it('sets the value to `rejected`', () => {
        const request: Request = createMock<Request>({
          url: 'my-url',
          cookies: {
            acceptAnalyticsCookies: 'false',
          },
        })

        setUpCookies()(request, response, next)

        expect(response.locals.analyticsCookiesPreference).toEqual('rejected')
      })
    })
  })

  describe('setting a flash message', () => {
    it('calls the flash method, used for displaying a cookie confirmation banner', () => {
      const request: Request = createMock<Request>({
        url: 'my-url',
      })

      setUpCookies()(request, response, next)

      expect(request.flash).toHaveBeenCalled()
    })
  })
})
