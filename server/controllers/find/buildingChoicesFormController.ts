import type { Request, Response, TypedRequestHandler } from 'express'

import { findPaths } from '../../paths'
import { FormUtils, TypeUtils } from '../../utils'
import type { BuildingChoicesSearchForm } from '@accredited-programmes/ui'

export default class BuildingChoicesFormController {
  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      FormUtils.setFieldErrors(req, res, ['isConvictedOfSexualOffence', 'isInAWomensPrison'])
      FormUtils.setFormValues(req, res)

      res.render('courses/buildingChoices/form/show', {
        backLinkHref: findPaths.pniFind.recommendedProgrammes({}),
        pageHeading: "About the person you're referring",
      })
    }
  }

  submit(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      let hasErrors = false
      const { courseId } = req.params
      const { isConvictedOfSexualOffence, isInAWomensPrison } = req.body as BuildingChoicesSearchForm

      if (!isConvictedOfSexualOffence) {
        req.flash('isConvictedOfSexualOffenceError', 'Select yes or no')
        hasErrors = true
      }

      if (!isInAWomensPrison) {
        req.flash('isInAWomensPrisonError', 'Select yes or no')
        hasErrors = true
      }

      if (hasErrors) {
        req.flash('formValues', [JSON.stringify({ isConvictedOfSexualOffence, isInAWomensPrison })])
        return res.redirect(findPaths.buildingChoices.form.show({ courseId }))
      }

      req.session.buildingChoicesFormData = { isConvictedOfSexualOffence, isInAWomensPrison }

      return res.redirect(findPaths.buildingChoices.show({ courseId }))
    }
  }
}
