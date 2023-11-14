import { path } from 'static-path'

const apiBasePath = path('/api')
const caseloadsPath = apiBasePath.path('users/me/caseLoads')
const offenceCodePath = apiBasePath.path('offences/code/:offenceCode')
const offenderBookingDetailPath = apiBasePath.path('bookings/offenderNo/:offenderNo')
const offenderSentenceAndOffencesPath = apiBasePath.path('offender-sentences/booking/:bookingId/sentences-and-offences')

export default {
  caseloads: {
    currentUser: caseloadsPath,
  },
  offenceCode: offenceCodePath,
  offenderBookingDetail: offenderBookingDetailPath,
  offenderSentenceAndOffences: offenderSentenceAndOffencesPath,
}
