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

  describe('index', () => {
    it('renders the dashboard index template', () => {
      const requestHandler = dashboardController.index()

      requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('dashboard/index', {
        assessCaseListPath: '/assess/referrals/case-list',
        findPath: findPaths.index({}),
        pageHeading: 'Accredited Programmes: find and refer',
        referCaseListPath: '/refer/referrals/case-list',
        reportPath: '/reports',
      })
    })
  })
})
