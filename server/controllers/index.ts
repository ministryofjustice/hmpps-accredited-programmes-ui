import DashboardController from './dashboardController'
import ProgrammesController from './find/programmesController'
import { Services } from '../services'

export const controllers = (services: Services) => {
  const dashboardController = new DashboardController()
  const programmesController = new ProgrammesController(services.programmeService)

  return {
    dashboardController,
    programmesController,
  }
}

export type Controllers = ReturnType<typeof controllers>
