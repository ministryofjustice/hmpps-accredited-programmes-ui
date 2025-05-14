import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import DashboardController from './dashboardController'
import { findPaths } from '../paths'

describe('DashboardController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let dashboardController: DashboardController

  beforeEach(() => {
    dashboardController = new DashboardController()
  })

  describe('accessibilityStatement', () => {
    it('renders the accessibility statement template', () => {
      const requestHandler = dashboardController.accessibilityStatement()

      requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('accessibilityStatement/index', {
        pageHeading: 'Accessibility statement',
      })
    })
  })

  describe('index', () => {
    it('renders the dashboard index template', () => {
      const requestHandler = dashboardController.index()

      requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('dashboard/index', {
        assessCaseListPath: '/assess/referrals/case-list',
        findAllProgrammesPath: '/find/programmes',
        findPath: findPaths.pniFind.personSearch({}),
        hspPath: '/hsp-referrals',
        pageHeading: 'Accredited Programmes: find and refer',
        referCaseListPath: '/refer/referrals/case-list',
        reportPath: '/reports',
        showHspLink: true,
      })
    })
  })
})
