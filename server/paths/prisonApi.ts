import { path } from 'static-path'

const prisonPath = path('/api/agencies/prison/:agencyId')

export default {
  prisons: {
    show: prisonPath,
  },
}
