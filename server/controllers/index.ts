import DashboardController from './dashboardController'
import findControllers from './find'
import type { Services } from '../services'

export const controllers = (services: Services) => {
  const dashboardController = new DashboardController()

  return {
    dashboardController,
    ...findControllers(services),
  }
}

export type Controllers = ReturnType<typeof controllers>
