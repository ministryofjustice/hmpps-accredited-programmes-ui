import { path } from 'static-path'

const coursesPath = path('/courses')
const courseNamesPath = coursesPath.path('course-names')
const coursePath = coursesPath.path(':courseId')
const offeringsByCoursePath = coursePath.path('offerings')

const offeringPath = path('/offerings/:courseOfferingId')
const courseByOfferingPath = offeringPath.path('course')

const oasysBasePath = path('/oasys/:prisonNumber')

const referralsPath = path('/referrals')
const referralPath = referralsPath.path(':referralId')
const updateStatusPath = referralPath.path('status')
const submitPath = referralPath.path('submit')
const dashboardPath = referralsPath.path('view/organisation/:organisationId/dashboard')
const myDashboardPath = referralsPath.path('view/me/dashboard')

const organisationsPath = path('/organisations')
const coursesByOrganisationPath = organisationsPath.path(':organisationId/courses')

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
  oasys: {
    attitude: oasysBasePath.path('attitude'),
    behaviour: oasysBasePath.path('behaviour'),
    health: oasysBasePath.path('health'),
    learningNeeds: oasysBasePath.path('learning-needs'),
    lifestyle: oasysBasePath.path('lifestyle'),
    offenceDetails: oasysBasePath.path('offence-details'),
    psychiatric: oasysBasePath.path('psychiatric'),
    relationships: oasysBasePath.path('relationships'),
    risksAndAlerts: oasysBasePath.path('risks-and-alerts'),
    roshAnalysis: oasysBasePath.path('rosh-analysis'),
  },
  offerings: {
    course: courseByOfferingPath,
    show: offeringPath,
  },
  organisations: {
    courses: coursesByOrganisationPath,
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
    myDashboard: myDashboardPath,
    show: referralPath,
    submit: submitPath,
    update: referralPath,
    updateStatus: updateStatusPath,
  },
}
