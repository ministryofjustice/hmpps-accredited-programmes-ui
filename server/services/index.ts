import ProgrammeService from './programmeService'
import UserService from './userService'
import { dataAccess } from '../data'

export const services = () => {
  const { hmppsAuthClient, programmeClientBuilder } = dataAccess()

  const userService = new UserService(hmppsAuthClient)
  const programmeService = new ProgrammeService(programmeClientBuilder)

  return {
    userService,
    programmeService,
  }
}

export type Services = ReturnType<typeof services>

export { UserService, ProgrammeService }
