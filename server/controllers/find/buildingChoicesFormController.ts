import type { Request, Response, TypedRequestHandler } from 'express'

import { findPaths } from '../../paths'
import { FormUtils, TypeUtils } from '../../utils'
import type { BuildingChoicesData } from '@accredited-programmes/ui'

export default class BuildingChoicesFormController {
  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const isPniFind = req.session.pniFindAndReferData !== undefined

      FormUtils.setFieldErrors(req, res, ['isConvictedOfSexualOffence', 'isInAWomensPrison'])
      FormUtils.setFormValues(req, res)

      res.render('courses/buildingChoices/form/show', {
        backLinkHref: isPniFind ? findPaths.pniFind.recommendedProgrammes({}) : findPaths.index({}),
        pageHeading: "About the person you're referring",
      })
    }
  }

  submit(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      let hasErrors = false
      const { courseId } = req.params
      const { isConvictedOfSexualOffence, isInAWomensPrison } = req.body as BuildingChoicesData

      if (!isConvictedOfSexualOffence) {
        req.flash('isConvictedOfSexualOffenceError', 'Select yes or no')
        hasErrors = true
      }

      if (!isInAWomensPrison) {
        req.flash('isInAWomensPrisonError', 'Select yes or no')
        hasErrors = true
      }

      req.flash('formValues', [JSON.stringify({ isConvictedOfSexualOffence, isInAWomensPrison })])

      if (hasErrors) {
        return res.redirect(findPaths.buildingChoices.form.show({ courseId }))
      }

      req.session.buildingChoicesData = { courseVariantId: courseId, isConvictedOfSexualOffence, isInAWomensPrison }

      return res.redirect(findPaths.buildingChoices.show({ courseId }))
    }
  }
}
