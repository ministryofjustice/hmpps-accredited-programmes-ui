/* istanbul ignore file */

import AddCourseController from './addCourseController'
import AddCourseOfferingController from './addCourseOfferingController'
import BuildingChoicesController from './buildingChoicesController'
import BuildingChoicesFormController from './buildingChoicesFormController'
import CourseOfferingsController from './courseOfferingsController'
import CoursesController from './coursesController'
import PersonSearchController from './personSearchController'
import RecommendedPathwayController from './recommendedPathwayController'
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
  const buildingChoicesFormController = new BuildingChoicesFormController()
  const coursesController = new CoursesController(services.courseService, services.organisationService)
  const courseOfferingsController = new CourseOfferingsController(services.courseService, services.organisationService)
  const personSearchController = new PersonSearchController(services.personService)
  const recommendedPathwayController = new RecommendedPathwayController(services.personService, services.pniService)
  const updateCourseController = new UpdateCourseController(services.courseService)
  const updateCourseOfferingController = new UpdateCourseOfferingController(
    services.courseService,
    services.organisationService,
  )

  return {
    addCourseController,
    addCourseOfferingController,
    buildingChoicesController,
    buildingChoicesFormController,
    courseOfferingsController,
    coursesController,
    personSearchController,
    recommendedPathwayController,
    updateCourseController,
    updateCourseOfferingController,
  }
}

export default controllers
