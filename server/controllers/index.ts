/* istanbul ignore file */

import DashboardController from './dashboardController'
import findControllers from './find'
import referControllers from './refer'
import sharedControllers from './shared'
import type { Services } from '../services'

export const controllers = (services: Services) => {
  const dashboardController = new DashboardController()

  return {
    dashboardController,
    ...findControllers(services),
    ...referControllers(services),
    ...sharedControllers(services),
  }
}

export type Controllers = ReturnType<typeof controllers>
