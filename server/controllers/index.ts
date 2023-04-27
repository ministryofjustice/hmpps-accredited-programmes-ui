import DashboardController from './dashboardController'

export const controllers = () => {
  const dashboardController = new DashboardController()

  return {
    dashboardController,
  }
}

export type Controllers = ReturnType<typeof controllers>
