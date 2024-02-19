import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import StatusHistoryController from './statusHistoryController'
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
import { CourseUtils, ShowReferralUtils } from '../../utils'
import type { Person, Referral } from '@accredited-programmes/models'

jest.mock('../../utils/referrals/showReferralUtils')

const mockShowReferralUtils = ShowReferralUtils as jest.Mocked<typeof ShowReferralUtils>

describe('StatusHistoryController', () => {
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
  const subNavigationItems = [{ active: true, href: 'sub-nav-href', text: 'Sub Nav Item' }]
  let person: Person
  let referral: Referral

  let controller: StatusHistoryController

  beforeEach(() => {
    person = personFactory.build()
    referral = referralFactory.submitted().build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })
    mockShowReferralUtils.subNavigationItems.mockReturnValue(subNavigationItems)

    courseService.getCourseByOffering.mockResolvedValue(course)
    courseService.getOffering.mockResolvedValue(courseOffering)
    personService.getPerson.mockResolvedValue(person)
    referralService.getReferral.mockResolvedValue(referral)

    controller = new StatusHistoryController(courseService, personService, referralService)

    request = createMock<Request>({
      params: { referralId: referral.id },
      path: referPaths.show.statusHistory({ referralId: referral.id }),
      user: { token: userToken, username },
    })
    response = Helpers.createMockResponseWithCaseloads()
  })

  describe('show', () => {
    it('should render the show template with the correct response locals', async () => {
      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/show/statusHistory/show', {
        pageHeading: `Referral to ${coursePresenter.nameAndAlternateName}`,
        pageSubHeading: 'Status history',
        person,
        referral,
        subNavigationItems,
      })

      expect(referralService.getReferral).toHaveBeenCalledWith(username, referral.id)
      expect(courseService.getCourseByOffering).toHaveBeenCalledWith(username, referral.offeringId)
      expect(personService.getPerson).toHaveBeenCalledWith(
        username,
        referral.prisonNumber,
        response.locals.user.caseloads,
      )
      expect(mockShowReferralUtils.subNavigationItems).toHaveBeenCalledWith(
        `/refer/referrals/${referral.id}/status-history`,
        'statusHistory',
        referral.id,
      )
    })
  })
})
