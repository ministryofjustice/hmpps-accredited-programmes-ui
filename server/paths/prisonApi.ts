import { path } from 'static-path'

const apiBasePath = path('/api')
const caseloadsPath = apiBasePath.path('users/me/caseLoads')
const offenceCodePath = apiBasePath.path('offences/code/:offenceCode')
const offenderPath = apiBasePath.path('bookings/offenderNo/:offenderNo')
const sentenceAndOffenceDetailsPath = apiBasePath.path('offender-sentences/booking/:bookingId/sentences-and-offences')

export default {
  caseloads: {
    currentUser: caseloadsPath,
  },
  offenceCode: offenceCodePath,
  offender: offenderPath,
  sentenceAndOffenceDetails: sentenceAndOffenceDetailsPath,
}
