import { path } from 'static-path'

const apiBasePath = path('/api')
const caseloadsPath = apiBasePath.path('users/me/caseLoads')
const sentenceAndOffenceDetailsPath = apiBasePath.path('offender-sentences/booking/:bookingId/sentences-and-offences')
const sentenceDatesPath = apiBasePath.path('bookings/:bookingId/sentenceDetail')

export default {
  caseloads: {
    currentUser: caseloadsPath,
  },
  sentenceAndOffenceDetails: sentenceAndOffenceDetailsPath,
  sentenceDates: sentenceDatesPath,
}
