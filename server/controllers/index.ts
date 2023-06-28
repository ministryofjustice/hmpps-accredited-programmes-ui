import DashboardController from './dashboardController'
import findControllers from './find'

const controllers = {
  dashboardController: new DashboardController(),
  ...findControllers,
}

export default controllers

export type Controllers = typeof controllers
