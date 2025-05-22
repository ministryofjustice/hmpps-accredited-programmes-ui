import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import BuildingChoicesFormController from './buildingChoicesFormController'
import { findPaths } from '../../paths'
import type { OrganisationService, PersonService } from '../../services'
import { personFactory } from '../../testutils/factories'
import { FormUtils } from '../../utils'
import type { Organisation } from '@accredited-programmes-api'

jest.mock('../../utils/formUtils')

describe('BuildingChoicesFormController', () => {
  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const organisationService = createMock<OrganisationService>({})
  const personService = createMock<PersonService>({})
  let controller: BuildingChoicesFormController

  const username = 'SOME_USERNAME'
  const courseId = 'A_COURSE_ID'

  beforeEach(() => {
    request = createMock<Request>({
      params: { courseId },
      user: { username },
    })
    response = createMock<Response>({})
    controller = new BuildingChoicesFormController(organisationService, personService)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('show', () => {
    it('should render the buildingChoices/show template', async () => {
      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, [
        'isConvictedOfSexualOffence',
        'isInAWomensPrison',
      ])
      expect(FormUtils.setFormValues).toHaveBeenCalledWith(request, response)
      expect(response.render).toHaveBeenCalledWith('courses/buildingChoices/form/show', {
        backLinkHref: findPaths.index({}),
        hideWomensPrisonQuestion: false,
        pageHeading: "Has the person you're referring been convicted of a sexual offence?",
        pageTitleOverride: "About the person you're referring",
      })
    })

    describe('when the user is coming from the PNI find page', () => {
      const prisonNumber = 'ABC1234'
      const person = personFactory.build({ name: 'Del Hatton', prisonId: 'HEW', prisonNumber })
      const organisation: Organisation = { code: 'HEW', gender: 'MALE', prisonName: 'Hewell' }

      beforeEach(() => {
        request.session.pniFindAndReferData = {
          prisonNumber,
          programmePathway: 'HIGH_INTENSITY_BC',
        }
        personService.getPerson.mockResolvedValue(person)
      })

      it('should render the buildingChoices/show template with correct response locals', async () => {
        organisationService.getOrganisationFromAcp.mockResolvedValue(organisation)

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, [
          'isConvictedOfSexualOffence',
          'isInAWomensPrison',
        ])
        expect(FormUtils.setFormValues).toHaveBeenCalledWith(request, response, { isInAWomensPrison: 'false' })
        expect(response.render).toHaveBeenCalledWith('courses/buildingChoices/form/show', {
          backLinkHref: findPaths.pniFind.recommendedProgrammes({}),
          hideWomensPrisonQuestion: true,
          pageHeading: 'Has Del Hatton been convicted of a sexual offence?',
          pageTitleOverride: "About the person you're referring",
        })
      })

      describe('when the organisation is a women’s prison', () => {
        it('should set `isInAWomensPrison` default form value to `true`', async () => {
          organisationService.getOrganisationFromAcp.mockResolvedValue({ ...organisation, gender: 'FEMALE' })

          const requestHandler = controller.show()
          await requestHandler(request, response, next)

          expect(FormUtils.setFormValues).toHaveBeenCalledWith(request, response, { isInAWomensPrison: 'true' })
        })
      })

      describe('when the person does not have a `prisonId`', () => {
        it('should not call the organisation service and set the correct response locals', async () => {
          personService.getPerson.mockResolvedValue({ ...person, prisonId: undefined })

          const requestHandler = controller.show()
          await requestHandler(request, response, next)

          expect(organisationService.getOrganisation).not.toHaveBeenCalled()
          expect(FormUtils.setFormValues).toHaveBeenCalledWith(request, response, { isInAWomensPrison: '' })
          expect(response.render).toHaveBeenCalledWith('courses/buildingChoices/form/show', {
            backLinkHref: findPaths.pniFind.recommendedProgrammes({}),
            hideWomensPrisonQuestion: false,
            pageHeading: 'Has Del Hatton been convicted of a sexual offence?',
            pageTitleOverride: "About the person you're referring",
          })
        })
      })
    })
  })

  describe('submit', () => {
    describe('when all options are selected', () => {
      it('should set the `buildingChoicesData` session data and redirect to the building choices course page', async () => {
        const formValues = { isConvictedOfSexualOffence: 'no', isInAWomensPrison: 'yes' }

        request.body = formValues

        expect(request.session.buildingChoicesData).toBeUndefined()

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(request.flash).toHaveBeenCalledWith('formValues', [JSON.stringify(formValues)])
        expect(request.session.buildingChoicesData).toEqual({ courseVariantId: courseId, ...formValues })
        expect(response.redirect).toHaveBeenCalledWith(findPaths.buildingChoices.show({ courseId }))
      })
    })

    describe('when no options are selected', () => {
      it('should redirect to the form show page with errors', async () => {
        request.body = { isConvictedOfSexualOffence: '', isInAWomensPrison: '' }

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(request.flash).toHaveBeenCalledWith('isConvictedOfSexualOffenceError', 'Select yes or no')
        expect(request.flash).toHaveBeenCalledWith('isInAWomensPrisonError', 'Select yes or no')
        expect(request.flash).toHaveBeenCalledWith('formValues', [
          JSON.stringify({ isConvictedOfSexualOffence: '', isInAWomensPrison: '' }),
        ])
        expect(response.redirect).toHaveBeenCalledWith(findPaths.buildingChoices.form.show({ courseId }))
      })
    })
  })
})
