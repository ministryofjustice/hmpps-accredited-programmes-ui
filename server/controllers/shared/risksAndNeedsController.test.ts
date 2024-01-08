import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import RisksAndNeedsController from './risksAndNeedsController'
import { referPaths } from '../../paths'
import type { CourseService, PersonService, ReferralService } from '../../services'
import {
  courseFactory,
  courseOfferingFactory,
  organisationFactory,
  personFactory,
  referralFactory,
} from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import { CourseUtils, DateUtils, ShowRisksAndNeedsUtils } from '../../utils'
import type { Person, Referral } from '@accredited-programmes/models'
import type { RisksAndNeedsSharedPageData } from '@accredited-programmes/ui'

jest.mock('../../utils/dateUtils')
jest.mock('../../utils/referrals/showRisksAndNeedsUtils')

describe('RisksAndNeedsController', () => {
  const userToken = 'SOME_TOKEN'
  const username = 'USERNAME'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const courseService = createMock<CourseService>({})
  const personService = createMock<PersonService>({})
  const referralService = createMock<ReferralService>({})

  const course = courseFactory.build()
  const coursePresenter = CourseUtils.presentCourse(course)
  const organisation = organisationFactory.build()
  const courseOffering = courseOfferingFactory.build({ organisationId: organisation.id })
  const importedFromDate = '10 January 2024'
  const navigationItems = [{ href: 'some-href', text: 'some-text' }]
  let person: Person
  let referral: Referral
  let sharedPageData: Omit<RisksAndNeedsSharedPageData, 'navigationItems'>

  let controller: RisksAndNeedsController

  beforeEach(() => {
    person = personFactory.build()
    referral = referralFactory.submitted().build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })
    ;(DateUtils.govukFormattedFullDateString as jest.Mock).mockReturnValue(importedFromDate)
    ;(ShowRisksAndNeedsUtils.navigationItems as jest.Mock).mockReturnValue(navigationItems)

    sharedPageData = {
      pageHeading: `Referral to ${coursePresenter.nameAndAlternateName}`,
      person,
      referral,
    }

    courseService.getCourseByOffering.mockResolvedValue(course)
    courseService.getOffering.mockResolvedValue(courseOffering)
    personService.getPerson.mockResolvedValue(person)
    referralService.getReferral.mockResolvedValue(referral)

    controller = new RisksAndNeedsController(courseService, personService, referralService)

    request = createMock<Request>({ params: { referralId: referral.id }, user: { token: userToken, username } })
    response = Helpers.createMockResponseWithCaseloads()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('offenceAnalysis', () => {
    it('renders the offence analysis page', async () => {
      request.path = referPaths.show.risksAndNeeds.offenceAnalysis({ referralId: referral.id })

      const requestHandler = controller.offenceAnalysis()
      await requestHandler(request, response, next)

      assertSharedDataServicesAreCalledWithExpectedArguments()

      expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/offenceAnalysis', {
        ...sharedPageData,
        importedFromText: `Imported from OASys on ${importedFromDate}.`,
        navigationItems,
      })
    })
  })

  function assertSharedDataServicesAreCalledWithExpectedArguments() {
    expect(referralService.getReferral).toHaveBeenCalledWith(username, referral.id)
    expect(courseService.getCourseByOffering).toHaveBeenCalledWith(username, referral.offeringId)
    expect(personService.getPerson).toHaveBeenCalledWith(username, person.prisonNumber, response.locals.user.caseloads)
  }
})
