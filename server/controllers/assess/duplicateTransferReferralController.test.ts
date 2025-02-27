import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import DuplicateTransferReferralController from './duplicateTransferReferralController'
import TransferReferralController from './transferReferralController'
import { assessPaths, referPaths } from '../../paths'
import type {
  CourseService,
  OrganisationService,
  PersonService,
  PniService,
  ReferralService,
  UserService,
} from '../../services'
import { courseFactory, organisationFactory, personFactory, referralFactory } from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import type { CourseOffering, Organisation, Person } from '@accredited-programmes/models'
import type { Course, PniScore, Referral } from '@accredited-programmes-api'

jest.mock('../../utils/formUtils')
jest.mock('../../utils/referrals/referralUtils')
jest.mock('../../utils/referrals/showReferralUtils')

describe('duplicateTransferReferralController', () => {
  const userToken = 'SOME_TOKEN'
  const username = 'USERNAME'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const courseService = createMock<CourseService>({})
  const orgService = createMock<OrganisationService>({})
  const personService = createMock<PersonService>({})
  const referralService = createMock<ReferralService>({})
  const userService = createMock<UserService>({})

  let person: Person
  let referral: Referral
  let org: Organisation
  let course: Course
  let buildingChoicesCourse: Course

  let controller: DuplicateTransferReferralController

  beforeEach(() => {
    person = personFactory.build()
    referral = referralFactory.submitted().build({ prisonNumber: person.prisonNumber })
    org = organisationFactory.build()
    course = courseFactory.build()
    buildingChoicesCourse = courseFactory.build()

    personService.getPerson.mockResolvedValue(person)
    referralService.getReferral.mockResolvedValue(referral)
    orgService.getOrganisation.mockResolvedValue(org)
    courseService.getCourseByOffering.mockResolvedValue(course)
    courseService.getBuildingChoicesCourseByReferral.mockResolvedValue(buildingChoicesCourse)

    controller = new DuplicateTransferReferralController(
      courseService,
      referralService,
      orgService,
      personService,
      userService,
    )

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
    
  })
  describe('withdraw tests', () => {
    it('when called, sets the session data and redirects to the withdraw reason page', async () => {
      const requestHandler = controller.withdraw()
      await requestHandler(request, response, next)

      expect(request.session.referralStatusUpdateData).toStrictEqual({
        decisionForCategoryAndReason: 'WITHDRAWN',
        finalStatusDecision: 'WITHDRAWN',
        initialStatusDecision: 'WITHDRAWN',
        referralId: referral.id,
      })
      expect(response.redirect).toHaveBeenCalledWith(referPaths.updateStatus.reason.show({ referralId: referral.id }))
    })
  })
})
