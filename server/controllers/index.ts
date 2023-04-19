import { Services } from '../services'
import DashboardController from './dashboardController'
import ProgrammesController from './find/programmesController'

export const controllers = (services: Services) => {
  const dashboardController = new DashboardController()
  const programmesController = new ProgrammesController(services.programmeService)

  return {
    dashboardController,
    programmesController,
  }
}

export type Controllers = ReturnType<typeof controllers>
