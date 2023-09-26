import { path } from 'static-path'

const caseloadsPath = path('/api/staff/:staffId/caseloads')

export default {
  staff: {
    caseloads: {
      index: caseloadsPath,
    },
  },
}
