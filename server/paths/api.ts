import { path } from 'static-path'

const coursesPath = path('/courses')
const courseNamesPath = coursesPath.path('course-names')
const coursePath = coursesPath.path(':courseId')
const offeringsByCoursePath = coursePath.path('offerings')

const offeringPath = path('/offerings/:courseOfferingId')
const courseByOfferingPath = offeringPath.path('course')

const oasysBasePath = path('/oasys/:prisonNumber')

const pniPathBasePath = path('/PNI')

const statisticsBasePath = path('/statistics')

const referralsPath = path('/referrals')
const referralPath = referralsPath.path(':referralId')
const updateStatusPath = referralPath.path('status')
const submitPath = referralPath.path('submit')
const dashboardPath = referralsPath.path('view/organisation/:organisationId/dashboard')
const myDashboardPath = referralsPath.path('view/me/dashboard')
const statusHistoryPath = referralPath.path('status-history')
const statusTransitionsPath = referralPath.path('status-transitions')
const confirmationTextPath = referralPath.path('confirmation-text/:chosenStatusCode')

const organisationsPath = path('/organisations')
const coursesByOrganisationPath = organisationsPath.path(':organisationId/courses')

const participationsByPersonPath = path('/people/:prisonNumber/course-participations')
const participationsPath = path('/course-participations')
const participationPath = participationsPath.path(':courseParticipationId')

const peoplePath = path('/people/:prisonNumber')
const prisonerSearchPath = path('/prisoner-search')

const referenceDataPath = path('/reference-data')
const referralStatusesPath = referenceDataPath.path('referral-statuses')

const referralStatusesCodeDataPath = referralStatusesPath.path(':referralStatusCode')
const referralStatusCodeCategoriesPath = referralStatusesPath.path(':referralStatusCode/categories')
const referralStatusCodeReasonsPath = referralStatusCodeCategoriesPath.path(':categoryCode/reasons')

export default {
  courses: {
    audiences: coursesPath.path('audiences'),
    buildingChoices: coursesPath.path('building-choices/:courseId'),
    buildingChoicesByReferral: coursesPath.path('building-choices/referral/:referralId'),
    create: coursesPath,
    index: coursesPath,
    names: courseNamesPath,
    offering: offeringsByCoursePath.path(':courseOfferingId'),
    offerings: offeringsByCoursePath,
    prerequisites: coursePath.path('prerequisites'),
    show: coursePath,
    update: coursePath,
  },
  oasys: {
    assessmentDate: oasysBasePath.path('assessment_date'),
    attitude: oasysBasePath.path('attitude'),
    behaviour: oasysBasePath.path('behaviour'),
    drugAndAlcoholDetails: oasysBasePath.path('drug-and-alcohol-details'),
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
    create: offeringsByCoursePath,
    show: offeringPath,
    update: offeringsByCoursePath,
  },
  organisations: {
    courses: coursesByOrganisationPath,
    enabled: organisationsPath.path('enabled'),
  },
  participations: {
    create: participationsPath,
    delete: participationPath,
    referral: participationsPath.path('referral/:referralId'),
    show: participationPath,
    update: participationPath,
  },
  people: {
    participations: participationsByPersonPath,
  },
  person: {
    prisonerSearch: prisonerSearchPath,
    prisonerSentences: peoplePath.path('sentences'),
  },
  pni: {
    show: pniPathBasePath.path(':prisonNumber'),
  },
  referenceData: {
    referralStatuses: {
      codeData: referralStatusesCodeDataPath,
      show: referralStatusesPath,
      statusCodeCategories: referralStatusCodeCategoriesPath,
      statusCodeReasons: referralStatusCodeReasonsPath,
      statusCodeReasonsWithCategories: referralStatusCodeCategoriesPath.path('reasons'),
    },
  },
  referrals: {
    confirmationText: confirmationTextPath,
    create: referralsPath,
    dashboard: dashboardPath,
    delete: referralPath,
    myDashboard: myDashboardPath,
    show: referralPath,
    statusHistory: statusHistoryPath,
    statusTransitions: statusTransitionsPath,
    submit: submitPath,
    update: referralPath,
    updateStatus: updateStatusPath,
  },
  statistics: {
    report: statisticsBasePath.path('report/:reportType'),
  },
}
