import { path } from 'static-path'

const caseloadsPath = path('/api/users/me/caseLoads')

export default {
  caseloads: {
    currentUser: caseloadsPath,
  },
}
