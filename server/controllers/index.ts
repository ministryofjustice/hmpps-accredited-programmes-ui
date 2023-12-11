/* istanbul ignore file */

import assessControllers from './assess'
import DashboardController from './dashboardController'
import findControllers from './find'
import referControllers from './refer'
import referNewControllers from './refer/new'
import sharedControllers from './shared'
import type { Services } from '../services'

export const controllers = (services: Services) => {
  const dashboardController = new DashboardController()

  return {
    dashboardController,
    ...assessControllers(services),
    ...findControllers(services),
    ...referControllers(services),
    ...referNewControllers(services),
    ...sharedControllers(services),
  }
}

export type Controllers = ReturnType<typeof controllers>
