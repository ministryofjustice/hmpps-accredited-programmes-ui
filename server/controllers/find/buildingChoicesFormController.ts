import type { Request, Response, TypedRequestHandler } from 'express'

import { findPaths } from '../../paths'
import type { OrganisationService, PersonService } from '../../services'
import { FormUtils, TypeUtils } from '../../utils'
import type { BuildingChoicesData } from '@accredited-programmes/ui'

export default class BuildingChoicesFormController {
  constructor(
    private readonly organisationService: OrganisationService,
    private readonly personService: PersonService,
  ) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { username } = req.user
      const pniFindPrisonNumber = req.session.pniFindAndReferData?.prisonNumber
      const pageTitleOverride = "About the person you're referring"
      const formTemplate = 'courses/buildingChoices/form/show'

      FormUtils.setFieldErrors(req, res, ['isConvictedOfSexualOffence', 'isInAWomensPrison'])

      if (!pniFindPrisonNumber) {
        FormUtils.setFormValues(req, res)

        return res.render(formTemplate, {
          backLinkHref: findPaths.index({}),
          hideWomensPrisonQuestion: false,
          pageHeading: "Has the person you're referring been convicted of a sexual offence?",
          pageTitleOverride,
        })
      }

      const person = await this.personService.getPerson(username, pniFindPrisonNumber)
      const organisation = person.prisonId
        ? await this.organisationService.getOrganisationFromAcp(username, person.prisonId)
        : undefined

      const isInAWomensPrisonValue = organisation?.gender ? (organisation.gender === 'FEMALE').toString() : ''

      FormUtils.setFormValues(req, res, { isInAWomensPrison: isInAWomensPrisonValue })

      return res.render(formTemplate, {
        backLinkHref: findPaths.pniFind.recommendedProgrammes({}),
        hideWomensPrisonQuestion: Boolean(isInAWomensPrisonValue),
        pageHeading: `Has ${person.name} been convicted of a sexual offence?`,
        pageTitleOverride,
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
