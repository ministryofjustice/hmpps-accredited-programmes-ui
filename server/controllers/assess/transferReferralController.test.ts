import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import TransferReferralController from './transferReferralController'
import { assessPaths } from '../../paths'
import type { CourseService, OrganisationService, PersonService, PniService, ReferralService } from '../../services'
import {
  courseFactory,
  courseOfferingFactory,
  organisationFactory,
  personFactory,
  pniScoreFactory,
  referralFactory,
} from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import type { CourseOffering, Organisation, Person } from '@accredited-programmes/models'
import type { Course, PniScore, Referral } from '@accredited-programmes-api'

jest.mock('../../utils/formUtils')
jest.mock('../../utils/referrals/referralUtils')
jest.mock('../../utils/referrals/showReferralUtils')

describe('TransferReferralController', () => {
  const userToken = 'SOME_TOKEN'
  const username = 'USERNAME'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const courseService = createMock<CourseService>({})
  const orgService = createMock<OrganisationService>({})
  const pniService = createMock<PniService>({})
  const personService = createMock<PersonService>({})
  const referralService = createMock<ReferralService>({})

  let person: Person
  let referral: Referral
  let org: Organisation
  let course: Course
  let buildingChoicesCourse: Course
  let offering: CourseOffering
  let pniResult: PniScore

  let controller: TransferReferralController

  beforeEach(() => {
    person = personFactory.build()
    referral = referralFactory.submitted().build({ prisonNumber: person.prisonNumber })
    org = organisationFactory.build()
    course = courseFactory.build()
    buildingChoicesCourse = courseFactory.build()
    offering = courseOfferingFactory.build()
    pniResult = pniScoreFactory.build()

    personService.getPerson.mockResolvedValue(person)
    referralService.getReferral.mockResolvedValue(referral)
    orgService.getOrganisation.mockResolvedValue(org)
    courseService.getCourseByOffering.mockResolvedValue(course)
    courseService.getOffering.mockResolvedValue(offering)
    courseService.getBuildingChoicesCourseByReferral.mockResolvedValue(buildingChoicesCourse)
    pniService.getPni.mockResolvedValue(pniResult)

    controller = new TransferReferralController(courseService, orgService, personService, pniService, referralService)

    request = createMock<Request>({
      params: { referralId: referral.id },
      user: { token: userToken, username },
    })
    response = Helpers.createMockResponseWithCaseloads()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('show tests', () => {
    it('Renders missing risks and needs error page when referral is not elligible for transfer', async () => {
      pniService.getPni.mockResolvedValue(null)
      const pageHeading = 'This referral cannot be moved to Building Choices'
      const errorMessages = [
        `This referral cannot be moved. Risk and need scores are missing for ${person.name}, so the recommended programme intensity (high or moderate) cannot be calculated.`,
        `You can see which scores are missing in the <a href="${assessPaths.show.pni({ referralId: referral.id })}">programme needs identifier</a>.`,
        'Update the missing information in OASys to move the referral, or withdraw this referral and submit a new one.',
      ]

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/transfer/error', {
        errorMessages,
        pageHeading,
        person,
        returnLinkHref: assessPaths.show.personalDetails({ referralId: referral.id }),
      })
    })
    it('Redirects to case list when referral is not elligible to be transferred', async () => {
      const closedReferral = referralFactory.closed().build()
      referralService.getReferral.mockResolvedValue(closedReferral)
      request.params.referralId = closedReferral.id

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(
        assessPaths.show.personalDetails({ referralId: closedReferral.id }),
      )
    })
    it('Renders inelligble due to risks and needs score error page when pni score is ALTERNATIVE_PATHWAY', async () => {
      pniService.getPni.mockResolvedValue(pniScoreFactory.build({ programmePathway: 'ALTERNATIVE_PATHWAY' }))
      const pageHeading = 'This referral cannot be moved to Building Choices'
      const errorMessages = [
        `This referral cannot be moved because the risk and need scores suggest that ${person.name} is not eligible for Building Choices. You can see these scores in the programme needs identifier.`,
      ]

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/transfer/error', {
        errorMessages,
        pageHeading,
        person,
        returnLinkHref: assessPaths.show.personalDetails({ referralId: referral.id }),
      })
    })
    it('Renders inelligble due to risks and needs score error page when pni is missing', async () => {
      pniService.getPni.mockRejectedValue(null)
      const pageHeading = 'This referral cannot be moved to Building Choices'
      const errorMessages = [
        `This referral cannot be moved. Risk and need scores are missing for ${person.name}, so the recommended programme intensity (high or moderate) cannot be calculated.`,
        `You can see which scores are missing in the <a href="${assessPaths.show.pni({ referralId: referral.id })}">programme needs identifier</a>.`,
        'Update the missing information in OASys to move the referral, or withdraw this referral and submit a new one.',
      ]

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(courseService.getBuildingChoicesCourseByReferral).toHaveBeenCalledTimes(0)
      expect(response.render).toHaveBeenCalledWith('referrals/transfer/error', {
        errorMessages,
        pageHeading,
        person,
        returnLinkHref: assessPaths.show.personalDetails({ referralId: referral.id }),
      })
    })
    it('Renders no BC course at prison error when no target BC course is found', async () => {
      pniService.getPni.mockResolvedValue(pniScoreFactory.build({ programmePathway: 'HIGH_INTENSITY' }))
      courseService.getBuildingChoicesCourseByReferral.mockResolvedValue(null)
      const pageHeading = 'This referral cannot be moved to Building Choices'
      const errorMessages = [
        `This referral cannot be moved because ${org.name} does not offer Building Choices: ${course.intensity?.toLocaleLowerCase()} intensity.`,
        'Close this referral and submit a new one to a different location.',
      ]

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/transfer/error', {
        errorMessages,
        pageHeading,
        person,
        returnLinkHref: assessPaths.show.personalDetails({ referralId: referral.id }),
      })
    })
    it('Redirects to the enter reason page when referral is elligible for transfer', async () => {
      pniService.getPni.mockResolvedValue(pniScoreFactory.build({ programmePathway: 'HIGH_INTENSITY' }))
      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(
        assessPaths.transferToBuildingChoices.reason.show({ referralId: referral.id }),
      )
    })
  })
})
