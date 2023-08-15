import { path } from 'static-path'

const prisonerPath = path('/prisoner/:prisonNumber')

export default {
  prisoner: {
    show: prisonerPath,
  },
}
