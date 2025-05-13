/* istanbul ignore file */

import AddCourseController from './addCourseController'
import AddCourseOfferingController from './addCourseOfferingController'
import BuildingChoicesController from './buildingChoicesController'
import BuildingChoicesFormController from './buildingChoicesFormController'
import CourseOfferingsController from './courseOfferingsController'
import CoursesController from './coursesController'
import HspDetailsController from './hspDetailsController'
import HspNotEligibleController from './hspNotEligibleController'
import HspReferralReasonController from './hspReferralReasonController'
import PersonSearchController from './personSearchController'
import RecommendedPathwayController from './recommendedPathwayController'
import RecommendedProgrammesController from './recommendedProgrammesController'
import UpdateCourseController from './updateCourseController'
import UpdateCourseOfferingController from './updateCourseOfferingController'
import type { Services } from '../../services'

const controllers = (services: Services) => {
  const addCourseController = new AddCourseController(services.courseService)
  const addCourseOfferingController = new AddCourseOfferingController(
    services.courseService,
    services.organisationService,
  )
  const buildingChoicesController = new BuildingChoicesController(services.courseService, services.organisationService)
  const buildingChoicesFormController = new BuildingChoicesFormController(
    services.organisationService,
    services.personService,
  )
  const coursesController = new CoursesController(services.courseService, services.organisationService)
  const courseOfferingsController = new CourseOfferingsController(services.courseService, services.organisationService)
  const personSearchController = new PersonSearchController(services.personService)
  const recommendedPathwayController = new RecommendedPathwayController(services.personService, services.pniService)
  const recommendedProgrammesController = new RecommendedProgrammesController(
    services.personService,
    services.courseService,
  )
  const updateCourseController = new UpdateCourseController(services.courseService)
  const updateCourseOfferingController = new UpdateCourseOfferingController(
    services.courseService,
    services.organisationService,
  )
  const hspDetailsController = new HspDetailsController(
    services.courseService,
    services.personService,
    services.referenceDataService,
  )
  const hspNotEligibleController = new HspNotEligibleController(services.courseService, services.personService)
  const hspReferralReasonController = new HspReferralReasonController(services.courseService)

  return {
    addCourseController,
    addCourseOfferingController,
    buildingChoicesController,
    buildingChoicesFormController,
    courseOfferingsController,
    coursesController,
    hspDetailsController,
    hspNotEligibleController,
    hspReferralReasonController,
    personSearchController,
    recommendedPathwayController,
    recommendedProgrammesController,
    updateCourseController,
    updateCourseOfferingController,
  }
}

export default controllers
