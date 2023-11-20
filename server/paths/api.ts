import { path } from 'static-path'

const coursesPath = path('/courses')
const courseNamesPath = coursesPath.path('course-names')
const coursePath = coursesPath.path(':courseId')
const offeringsByCoursePath = coursePath.path('offerings')

const offeringPath = path('/offerings/:courseOfferingId')
const courseByOfferingPath = offeringPath.path('course')

const referralsPath = path('/referrals')
const referralPath = referralsPath.path(':referralId')
const updateStatusPath = referralPath.path('status')
const submitPath = referralPath.path('submit')
const dashboardPath = referralsPath.path('organisation/:organisationId/dashboard')

const participationsByPersonPath = path('/people/:prisonNumber/course-participations')
const participationsPath = path('/course-participations')
const participationPath = participationsPath.path(':courseParticipationId')

export default {
  courses: {
    index: coursesPath,
    names: courseNamesPath,
    offerings: offeringsByCoursePath,
    show: coursePath,
  },
  offerings: {
    course: courseByOfferingPath,
    show: offeringPath,
  },
  participations: {
    create: participationsPath,
    delete: participationPath,
    show: participationPath,
    update: participationPath,
  },
  people: {
    participations: participationsByPersonPath,
  },
  referrals: {
    create: referralsPath,
    dashboard: dashboardPath,
    show: referralPath,
    submit: submitPath,
    update: referralPath,
    updateStatus: updateStatusPath,
  },
}
