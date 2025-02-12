import type { Router } from 'express'

import type { Controllers } from '../controllers'
import { ApplicationRoles } from '../middleware'
import { findPaths } from '../paths'
import { RouteUtils } from '../utils'
import type { MiddlewareOptions } from '@accredited-programmes/users'

export default function routes(controllers: Controllers, router: Router): Router {
  const { get, post } = RouteUtils.actions(router)
  const { buildingChoicesController, buildingChoicesFormController, coursesController, courseOfferingsController } =
    controllers
  const referrers: MiddlewareOptions = { allowedRoles: [ApplicationRoles.ACP_REFERRER] }
  const editorsAndReferrers: MiddlewareOptions = {
    allowedRoles: [ApplicationRoles.ACP_EDITOR, ApplicationRoles.ACP_REFERRER],
  }

  get(findPaths.index.pattern, coursesController.index(), { allowedRoles: [ApplicationRoles.ACP_EDITOR] })

  get(findPaths.show.pattern, coursesController.show(), editorsAndReferrers)
  get(findPaths.offerings.show.pattern, courseOfferingsController.show(), editorsAndReferrers)

  get(findPaths.buildingChoices.show.pattern, buildingChoicesController.show(), editorsAndReferrers)

  get(findPaths.buildingChoices.form.show.pattern, buildingChoicesFormController.show(), referrers)
  post(findPaths.buildingChoices.form.submit.pattern, buildingChoicesFormController.submit(), referrers)

  get(findPaths.pniFind.personSearch.pattern, controllers.personSearchController.show(), referrers)
  post(findPaths.pniFind.personSearch.pattern, controllers.personSearchController.submit(), referrers)

  get(findPaths.pniFind.recommendedPathway.pattern, controllers.recommendedPathwayController.show(), referrers)

  get(findPaths.pniFind.recommendedProgrammes.pattern, controllers.recommendedProgrammesController.show(), referrers)

  return router
}
