import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import DashboardController from './dashboardController'
import findPaths from '../paths/find'

describe('DashboardController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let dashboardController: DashboardController

  beforeEach(() => {
    dashboardController = new DashboardController()
  })

  describe('index', () => {
    it('should render the dashboard template', () => {
      const requestHandler = dashboardController.index()

      requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('dashboard/index', {
        pageHeading: 'Accredited Programmes',
        findPath: findPaths.courses.index({}),
      })
    })
  })
})
