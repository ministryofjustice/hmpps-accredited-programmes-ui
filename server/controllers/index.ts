/* istanbul ignore file */

import type { Services } from '../services'
import assessControllers from './assess'
import DashboardController from './dashboardController'
import findControllers from './find'
import referControllers from './refer'
import ReportsController from './reportsController'
import sharedControllers from './shared'

export const controllers = (services: Services) => {
  const dashboardController = new DashboardController()
  const reportsController = new ReportsController(services.organisationService, services.statisticsService)

  return {
    dashboardController,
    reportsController,
    ...assessControllers(services),
    ...findControllers(services),
    ...referControllers(services),
    ...sharedControllers(services),
  }
}

export type Controllers = ReturnType<typeof controllers>
