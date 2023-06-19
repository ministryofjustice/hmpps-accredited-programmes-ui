import { path } from 'static-path'

const prisonPath = path('/prisons/id/:prisonId')

export default {
  prisons: {
    show: prisonPath,
  },
}
