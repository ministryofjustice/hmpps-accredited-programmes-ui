import CookiePolicyController from './cookiePolicyController'
import DashboardController from './dashboardController'
import findControllers from './find'
import type { Services } from '../services'

export const controllers = (services: Services) => {
  const dashboardController = new DashboardController()
  const cookiePolicyController = new CookiePolicyController()

  return {
    dashboardController,
    cookiePolicyController,
    ...findControllers(services),
  }
}

export type Controllers = ReturnType<typeof controllers>
