import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { when } from 'jest-when'

import TransferReferralErrorController from './transferReferralErrorController'
import { assessPaths } from '../../paths'
import type { CourseService, OrganisationService, PersonService } from '../../services'
import {
  courseFactory,
  courseOfferingFactory,
  organisationFactory,
  personFactory,
  referralFactory,
} from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import type { Referral } from '@accredited-programmes-api'

describe('TransferReferralErrorController', () => {
  const userToken = 'SOME_TOKEN'
  const username = 'USERNAME'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const courseService = createMock<CourseService>({})
  const organisationService = createMock<OrganisationService>({})
  const personService = createMock<PersonService>({})

  const person = personFactory.build()
  const originalOfferingOrganisation = organisationFactory.build()
  const originalCourseOffering = courseOfferingFactory.build({ organisationId: originalOfferingOrganisation.id })
  const originalCourse = courseFactory.build({
    courseOfferings: [originalCourseOffering],
    intensity: 'MODERATE',
  })
  let referral: Referral

  let controller: TransferReferralErrorController

  beforeEach(() => {
    referral = referralFactory.submitted().build({ prisonNumber: person.prisonNumber })

    when(personService.getPerson).calledWith(username, referral.prisonNumber).mockResolvedValue(person)

    controller = new TransferReferralErrorController(courseService, organisationService, personService)

    request = createMock<Request>({
      params: { referralId: referral.id },
      path: assessPaths.transfer.error.show({ referralId: referral.id }),
      user: { token: userToken, username },
    })
    response = Helpers.createMockResponseWithCaseloads()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('show', () => {
    it('should redirect to personal details if there is no transfer error data', async () => {
      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(assessPaths.show.personalDetails({ referralId: referral.id }))
    })

    describe('when there is `transferErrorData` in the session', () => {
      const transferErrorDataDefaults = {
        originalOfferingId: originalCourseOffering.id,
        prisonNumber: person.prisonNumber,
      }

      it('should render the error page with the correct response locals', async () => {
        request.session.transferErrorData = {
          ...transferErrorDataDefaults,
          errorMessage: 'AN_ERROR',
        }

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('referrals/transfer/error/show', {
          backLinkHref: assessPaths.show.personalDetails({ referralId: referral.id }),
          errorText: ['This referral cannot be moved at the moment because of an error. Try again later.'],
          pageHeading: 'Cannot complete move to Building Choices',
          person,
        })
      })

      describe('and the `errorMessage` is `DUPLICATE`', () => {
        it('should redirect to the duplicate referral page', async () => {
          request.session.transferErrorData = {
            ...transferErrorDataDefaults,
            duplicateReferralId: 'duplicate-referral-id',
            errorMessage: 'DUPLICATE',
          }

          const requestHandler = controller.show()
          await requestHandler(request, response, next)

          expect(response.redirect).toHaveBeenCalledWith(
            assessPaths.show.duplicate({ referralId: 'duplicate-referral-id' }),
          )
        })
      })

      describe('and the `errorMessage` is `MISSING_INFORMATION`', () => {
        it('should render the error page with the correct response locals', async () => {
          request.session.transferErrorData = {
            ...transferErrorDataDefaults,
            errorMessage: 'MISSING_INFORMATION',
          }

          const requestHandler = controller.show()
          await requestHandler(request, response, next)

          expect(response.render).toHaveBeenCalledWith('referrals/transfer/error/show', {
            backLinkHref: assessPaths.show.personalDetails({ referralId: referral.id }),
            errorText: [
              `This referral cannot be moved. Risk and need scores are missing for ${person.name}, so the recommended programme intensity (high or moderate) cannot be calculated.`,
              `You can see which scores are missing in the <a href="${assessPaths.show.pni({ referralId: referral.id })}">programme needs identifier</a>.`,
              'Update the missing information in OASys to move the referral, or withdraw this referral and submit a new one.',
            ],
            pageHeading: 'This referral cannot be moved to Building Choices',
            person,
          })
        })
      })

      describe('and the `errorMessage` is `ALTERNATIVE_PATHWAY`', () => {
        it('should render the error page with the correct response locals', async () => {
          request.session.transferErrorData = {
            ...transferErrorDataDefaults,
            errorMessage: 'ALTERNATIVE_PATHWAY',
          }

          const requestHandler = controller.show()
          await requestHandler(request, response, next)

          expect(response.render).toHaveBeenCalledWith('referrals/transfer/error/show', {
            backLinkHref: assessPaths.show.personalDetails({ referralId: referral.id }),
            errorText: [
              `This referral cannot be moved because the risk and need scores suggest that ${person.name} is not eligible for Building Choices. You can see these scores in the programme needs identifier.`,
            ],
            pageHeading: 'This referral cannot be moved to Building Choices',
            person,
          })
        })
      })

      describe('and the `errorMessage` is `NO_COURSE`', () => {
        it('should render the error page with the correct response locals', async () => {
          when(courseService.getCourseByOffering)
            .calledWith(username, originalCourseOffering.id)
            .mockResolvedValue(originalCourse)
          when(courseService.getOffering)
            .calledWith(username, originalCourseOffering.id)
            .mockResolvedValue(originalCourseOffering)
          when(organisationService.getOrganisation)
            .calledWith(userToken, originalCourseOffering.organisationId)
            .mockResolvedValue(originalOfferingOrganisation)

          request.session.transferErrorData = {
            ...transferErrorDataDefaults,
            errorMessage: 'NO_COURSE',
          }

          const requestHandler = controller.show()
          await requestHandler(request, response, next)

          expect(response.render).toHaveBeenCalledWith('referrals/transfer/error/show', {
            backLinkHref: assessPaths.show.personalDetails({ referralId: referral.id }),
            errorText: [
              `This referral cannot be moved because ${originalOfferingOrganisation.name} does not offer Building Choices: ${originalCourse.intensity?.toLowerCase()} intensity.`,
              'Close this referral and submit a new one to a different location.',
            ],
            pageHeading: 'This referral cannot be moved to Building Choices',
            person,
          })
        })
      })
    })
  })
})
