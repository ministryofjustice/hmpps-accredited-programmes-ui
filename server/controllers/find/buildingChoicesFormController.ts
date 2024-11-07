import type { Request, Response, TypedRequestHandler } from 'express'

import { findPaths } from '../../paths'
import type { CourseService } from '../../services'
import { FormUtils, TypeUtils } from '../../utils'
import type { BuildingChoicesSearchForm } from '@accredited-programmes/ui'

export default class BuildingChoicesFormController {
  constructor(private readonly courseService: CourseService) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      FormUtils.setFieldErrors(req, res, ['isConvictedOfSexualOffence', 'isInAWomensPrison'])
      FormUtils.setFormValues(req, res)

      res.render('courses/offerings/buildingChoices/show', {
        backLinkHref: findPaths.index({}),
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
        req.flash('isConvictedOfSexualOffenceError', 'Select an option')
        hasErrors = true
      }

      if (!isInAWomensPrison) {
        req.flash('isInAWomensPrisonError', 'Select an option')
        hasErrors = true
      }

      if (hasErrors) {
        req.flash('formValues', [JSON.stringify({ isConvictedOfSexualOffence, isInAWomensPrison })])
        return res.redirect(findPaths.buildingChoices.form.show({ courseId }))
      }

      const buildingChoicesCourseVariants = await this.courseService.getBuildingChoicesVariants(
        req.user.username,
        courseId,
        {
          isConvictedOfSexualOffence,
          isInAWomensPrison,
        },
      )

      const course = buildingChoicesCourseVariants[0]

      return res.redirect(findPaths.show({ courseId: course.id }))
    }
  }
}
