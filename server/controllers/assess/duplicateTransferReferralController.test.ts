import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import DuplicateTransferReferralController from './duplicateTransferReferralController'
import { assessPaths, referPaths } from '../../paths'
import type { CourseService, OrganisationService, PersonService, ReferralService, UserService } from '../../services'
import {
  courseFactory,
  courseOfferingFactory,
  organisationFactory,
  personFactory,
  referralFactory,
} from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import { CourseUtils, ShowReferralUtils } from '../../utils'
import type { CourseOffering, Organisation, Person } from '@accredited-programmes/models'
import type { Course, Referral } from '@accredited-programmes-api'

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
  let offering: CourseOffering

  let controller: DuplicateTransferReferralController

  beforeEach(() => {
    person = personFactory.build()
    referral = referralFactory.submitted().build({ prisonNumber: person.prisonNumber })
    org = organisationFactory.build()
    course = courseFactory.build()
    buildingChoicesCourse = courseFactory.build()
    offering = courseOfferingFactory.build()

    personService.getPerson.mockResolvedValue(person)
    referralService.getReferral.mockResolvedValue(referral)
    orgService.getOrganisation.mockResolvedValue(org)
    courseService.getCourseByOffering.mockResolvedValue(course)
    courseService.getBuildingChoicesCourseByReferral.mockResolvedValue(buildingChoicesCourse)
    userService.getEmailFromUsername.mockResolvedValue('dummy@email')
    userService.getFullNameFromUsername.mockResolvedValue('someone')

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
    it('when called with a valid referral id, shows the duplicate referral error page', async () => {
      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/transfer/duplicate', {
        backLinkHref: assessPaths.show.personalDetails({ referralId: referral.id }),
        cancelHref: assessPaths.show.programmeHistory({ referralId: referral.id }),
        courseOfferingSummaryListRows: ShowReferralUtils.courseOfferingSummaryListRows(
          person.name,
          CourseUtils.presentCourse(course),
          offering.contactEmail,
          org.name,
        ),
        pageHeading: 'Duplicate referral found',
        pageTitleOverride: 'Duplicate referral found',
        submissionSummaryListRows: ShowReferralUtils.submissionSummaryListRows(
          referral.submittedOn,
          'someone',
          'dummy@email',
          referral.primaryPrisonOffenderManager,
        ),
        summaryText: `A referral already exists for ${person.name} to ${course.displayName} at ${org.name}.`,
        withdrawButtonText: `Withdraw referral to ${course.displayName}`,
        withdrawHref: assessPaths.updateStatus.reason.show({ referralId: referral.id }),
      })
    })
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
