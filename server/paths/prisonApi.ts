import { path } from 'static-path'

const caseloadsPath = path('/api/users/me/caseLoads')

export default {
  users: {
    current: {
      caseloads: caseloadsPath,
    },
  },
}
