import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import CookiePolicyController from './cookiePolicyController'

describe('CookiePolicyController', () => {
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let cookiePolicyController: CookiePolicyController

  beforeEach(() => {
    cookiePolicyController = new CookiePolicyController()
  })

  describe('index', () => {
    const response: DeepMocked<Response> = createMock<Response>({})
    const request: DeepMocked<Request> = createMock<Request>({})

    it('renders the cookie policy template', () => {
      const requestHandler = cookiePolicyController.index()

      requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('cookiePolicy/index', {
        pageHeading: 'Cookies',
      })
    })
  })

  describe('update', () => {
    describe('when the request contains the `acceptAnalyticsCookies` parameter', () => {
      // For some reason the usual `DeepMocked` Response is failing when verifying `redirect` is called on it.
      // The mocked value was being marked as deprecated by my editor, so it may be trying to call the wrong function,
      // so we create our own here.
      const mockedResponse: Response = {
        cookie: jest.fn(() => mockedResponse),
        redirect: jest.fn(),
      } as unknown as Response

      describe('and the session has a `returnTo` value set', () => {
        it('sets the `acceptAnalyticsCookies` cookie and redirects to the page specified by `returnTo`', () => {
          const request: DeepMocked<Request> = createMock<Request>({
            body: {
              acceptAnalyticsCookies: 'true',
            },
            session: {
              returnTo: 'my-url',
            },
          })

          const requestHandler = cookiePolicyController.update()

          requestHandler(request, mockedResponse, next)

          expect(request.flash).toHaveBeenCalledWith('cookies', 'saved')
          expect(mockedResponse.cookie).toHaveBeenCalledWith('acceptAnalyticsCookies', 'true')
          expect(mockedResponse.redirect).toHaveBeenCalledWith(302, 'my-url')
        })
      })

      describe('and the session has no `returnTo` value set', () => {
        it('sets the `acceptAnalyticsCookies` cookie and redirects to the root page', () => {
          const request: DeepMocked<Request> = createMock<Request>({
            body: {
              acceptAnalyticsCookies: 'false',
            },
          })

          const requestHandler = cookiePolicyController.update()

          requestHandler(request, mockedResponse, next)

          expect(request.flash).toHaveBeenCalledWith('cookies', 'saved')
          expect(mockedResponse.cookie).toHaveBeenCalledWith('acceptAnalyticsCookies', 'false')
          expect(mockedResponse.redirect).toHaveBeenCalledWith(302, '/')
        })
      })
    })
  })
})
