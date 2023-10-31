/* istanbul ignore file */

import DashboardController from './dashboardController'
import findControllers from './find'
import referNewControllers from './refer/new'
import sharedControllers from './shared'
import type { Services } from '../services'

export const controllers = (services: Services) => {
  const dashboardController = new DashboardController()

  return {
    dashboardController,
    ...findControllers(services),
    ...referNewControllers(services),
    ...sharedControllers(services),
  }
}

export type Controllers = ReturnType<typeof controllers>
