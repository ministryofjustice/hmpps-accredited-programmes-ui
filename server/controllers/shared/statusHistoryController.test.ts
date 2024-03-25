import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import StatusHistoryController from './statusHistoryController'
import { assessPaths, referPaths } from '../../paths'
import type { CourseService, PersonService, ReferralService } from '../../services'
import {
  courseFactory,
  courseOfferingFactory,
  organisationFactory,
  personFactory,
  referralFactory,
  referralStatusHistoryFactory,
  referralStatusRefDataFactory,
} from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import { CourseUtils, ShowReferralUtils } from '../../utils'
import type { Person, Referral, ReferralStatusRefData } from '@accredited-programmes/models'
import type { MojTimelineItem, ReferralStatusHistoryPresenter } from '@accredited-programmes/ui'

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
  const buttons = [{ href: 'button-href', text: 'Button' }]
  const timelineItems: Array<MojTimelineItem> = [
    {
      byline: { text: 'Test User' },
      datetime: { timestamp: new Date().toISOString(), type: 'datetime' },
      html: 'html',
      label: { text: 'Referral submitted' },
    },
  ]
  let person: Person
  let referral: Referral
  let referralStatusHistory: Array<ReferralStatusHistoryPresenter>
  let statusTransitions: Array<ReferralStatusRefData>

  let controller: StatusHistoryController

  beforeEach(() => {
    person = personFactory.build()
    referral = referralFactory.submitted().build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })
    referralStatusHistory = [{ ...referralStatusHistoryFactory.started().build(), byLineText: 'You' }]
    statusTransitions = referralStatusRefDataFactory.buildList(2)
    mockShowReferralUtils.subNavigationItems.mockReturnValue(subNavigationItems)
    mockShowReferralUtils.statusHistoryTimelineItems.mockReturnValue(timelineItems)
    mockShowReferralUtils.buttons.mockReturnValue(buttons)

    courseService.getCourseByOffering.mockResolvedValue(course)
    courseService.getOffering.mockResolvedValue(courseOffering)
    personService.getPerson.mockResolvedValue(person)
    referralService.getReferral.mockResolvedValue(referral)
    referralService.getReferralStatusHistory.mockResolvedValue(referralStatusHistory)
    referralService.getStatusTransitions.mockResolvedValue(statusTransitions)

    controller = new StatusHistoryController(courseService, personService, referralService)

    request = createMock<Request>({
      params: { referralId: referral.id },
      path: referPaths.show.statusHistory({ referralId: referral.id }),
      user: { token: userToken, username },
    })
    response = Helpers.createMockResponseWithCaseloads()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('show', () => {
    it('should render the show template with the correct response locals', async () => {
      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/show/statusHistory/show', {
        buttons,
        pageHeading: `Referral to ${coursePresenter.nameAndAlternateName}`,
        pageSubHeading: 'Status history',
        person,
        referral,
        subNavigationItems,
        timelineItems,
      })

      expect(referralService.getReferral).toHaveBeenCalledWith(username, referral.id, {})
      expect(courseService.getCourseByOffering).toHaveBeenCalledWith(username, referral.offeringId)
      expect(referralService.getReferralStatusHistory).toHaveBeenCalledWith(userToken, username, referral.id)
      expect(referralService.getStatusTransitions).toHaveBeenCalledWith(username, referral.id)
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
      expect(mockShowReferralUtils.buttons).toHaveBeenCalledWith(request.path, referral, statusTransitions)
      expect(mockShowReferralUtils.statusHistoryTimelineItems).toHaveBeenCalledWith(referralStatusHistory)
    })

    it('should reset the `referralStatusUpdateData` session data', async () => {
      request.session.referralStatusUpdateData = { referralId: referral.id, status: 'WITHDRAWN' }

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(request.session.referralStatusUpdateData).toBeUndefined()
    })

    describe('when the page has been visited with an `updatePerson` query parameter', () => {
      it('should pass the `updatePerson` query parameter to the `getReferral` method', async () => {
        const updatePerson = 'true'
        request.query = { updatePerson }

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referral.id, { updatePerson })
      })
    })

    describe('when on the assess path', () => {
      it('should not call `getStatusTransitions`', async () => {
        request.path = assessPaths.show.statusHistory({ referralId: referral.id })

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(referralService.getStatusTransitions).not.toHaveBeenCalled()
        expect(mockShowReferralUtils.buttons).toHaveBeenCalledWith(request.path, referral, undefined)
      })
    })
  })
})
