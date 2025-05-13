import type { Router } from 'express'

import type { Controllers } from '../controllers'
import { findPaths } from '../paths'
import { RouteUtils } from '../utils'

export default function routes(controllers: Controllers, router: Router): Router {
  const { get, post } = RouteUtils.actions(router)
  const {
    buildingChoicesController,
    buildingChoicesFormController,
    coursesController,
    courseOfferingsController,
    hspDetailsController,
    hspNotEligibleController,
  } = controllers

  get(findPaths.index.pattern, coursesController.index())

  get(findPaths.show.pattern, coursesController.show())
  get(findPaths.offerings.show.pattern, courseOfferingsController.show())

  get(findPaths.buildingChoices.show.pattern, buildingChoicesController.show())

  get(findPaths.buildingChoices.form.show.pattern, buildingChoicesFormController.show())
  post(findPaths.buildingChoices.form.submit.pattern, buildingChoicesFormController.submit())

  get(findPaths.pniFind.personSearch.pattern, controllers.personSearchController.show())
  post(findPaths.pniFind.personSearch.pattern, controllers.personSearchController.submit())

  get(findPaths.pniFind.recommendedPathway.pattern, controllers.recommendedPathwayController.show())

  get(findPaths.pniFind.recommendedProgrammes.pattern, controllers.recommendedProgrammesController.show())

  get(findPaths.hsp.details.show.pattern, hspDetailsController.show())
  post(findPaths.hsp.details.submit.pattern, hspDetailsController.submit())

  get(findPaths.hsp.notEligible.show.pattern, hspNotEligibleController.show())

  return router
}
