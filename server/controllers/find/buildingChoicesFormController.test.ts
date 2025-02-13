import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import BuildingChoicesFormController from './buildingChoicesFormController'
import { findPaths } from '../../paths'
import { FormUtils } from '../../utils'

jest.mock('../../utils/formUtils')

describe('BuildingChoicesFormController', () => {
  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let controller: BuildingChoicesFormController

  const username = 'SOME_USERNAME'
  const courseId = 'A_COURSE_ID'

  beforeEach(() => {
    request = createMock<Request>({
      params: { courseId },
      user: { username },
    })
    response = createMock<Response>({})
    controller = new BuildingChoicesFormController()
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
        pageHeading: "About the person you're referring",
      })
    })

    describe('when the user is coming from the PNI find page', () => {
      it('should render the buildingChoices/show template with the back link to recommended programmes', async () => {
        request.session.pniFindAndReferData = {
          prisonNumber: 'ABC1234',
          programmePathway: 'HIGH_INTENSITY_BC',
        }

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, [
          'isConvictedOfSexualOffence',
          'isInAWomensPrison',
        ])
        expect(FormUtils.setFormValues).toHaveBeenCalledWith(request, response)
        expect(response.render).toHaveBeenCalledWith(
          'courses/buildingChoices/form/show',
          expect.objectContaining({
            backLinkHref: findPaths.pniFind.recommendedProgrammes({}),
          }),
        )
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
