import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { when } from 'jest-when'

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
import type { Person, ReferralStatusRefData } from '@accredited-programmes/models'
import type { CoursePresenter, MojTimelineItem, ReferralStatusHistoryPresenter } from '@accredited-programmes/ui'
import type { Course, Referral } from '@accredited-programmes-api'

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
  const organisation = organisationFactory.build()
  const courseOffering = courseOfferingFactory.build({ organisationId: organisation.id })
  const subNavigationItems = [{ active: true, href: 'sub-nav-href', text: 'Sub Nav Item' }]
  const buttonMenu = {
    button: {
      classes: 'govuk-button--secondary',
      text: 'Update referral',
    },
    items: [],
  }
  const buttons = [{ href: 'button-href', text: 'Button' }]
  const timelineItems: Array<MojTimelineItem> = [
    {
      byline: { text: 'Test User' },
      datetime: { timestamp: new Date().toISOString(), type: 'datetime' },
      html: 'html',
      label: { text: 'Referral submitted' },
    },
  ]
  const recentCaseListPath = '/case-list-path'
  let course: Course
  let coursePresenter: CoursePresenter
  let person: Person
  let originalReferral: Referral
  let referral: Referral
  let transferredReferral: Referral
  let referralStatusHistory: Array<ReferralStatusHistoryPresenter>
  let statusTransitions: Array<ReferralStatusRefData>

  let controller: StatusHistoryController

  beforeEach(() => {
    course = courseFactory.build()
    coursePresenter = CourseUtils.presentCourse(course)
    person = personFactory.build()
    originalReferral = referralFactory.closed().build({ offeringId: courseOffering.id })
    transferredReferral = referralFactory.submitted().build({ originalReferralId: originalReferral.id })
    referral = referralFactory
      .submitted()
      .build({ offeringId: courseOffering.id, originalReferralId: undefined, prisonNumber: person.prisonNumber })
    referralStatusHistory = [{ ...referralStatusHistoryFactory.started().build(), byLineText: 'You' }]
    statusTransitions = referralStatusRefDataFactory.buildList(2)
    mockShowReferralUtils.subNavigationItems.mockReturnValue(subNavigationItems)
    mockShowReferralUtils.statusHistoryTimelineItems.mockReturnValue(timelineItems)
    mockShowReferralUtils.buttons.mockReturnValue(buttons)
    mockShowReferralUtils.buttonMenu.mockReturnValue(buttonMenu)

    when(referralService.getReferral).calledWith(username, referral.id, expect.any(Object)).mockResolvedValue(referral)
    when(referralService.getReferral).calledWith(username, originalReferral.id).mockResolvedValue(originalReferral)
    when(referralService.getReferral)
      .calledWith(username, transferredReferral.id, expect.any(Object))
      .mockResolvedValue(transferredReferral)

    when(referralService.getReferral).calledWith(username, referral.id, expect.any(Object)).mockResolvedValue(referral)
    when(referralService.getReferral).calledWith(username, originalReferral.id).mockResolvedValue(originalReferral)
    when(referralService.getReferral)
      .calledWith(username, transferredReferral.id, expect.any(Object))
      .mockResolvedValue(transferredReferral)

    courseService.getCourseByOffering.mockResolvedValue(course)
    courseService.getOffering.mockResolvedValue(courseOffering)
    personService.getPerson.mockResolvedValue(person)

    referralService.getReferralStatusHistory.mockResolvedValue(referralStatusHistory)
    referralService.getStatusTransitions.mockResolvedValue(statusTransitions)

    controller = new StatusHistoryController(courseService, personService, referralService)

    request = createMock<Request>({
      params: { referralId: referral.id },
      path: referPaths.show.statusHistory({ referralId: referral.id }),
      session: { recentCaseListPath },
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
        buttonMenu,
        buttons,
        hideTitleServiceName: true,
        pageHeading: `Referral to ${coursePresenter.displayName}`,
        pageSubHeading: 'Status history',
        pageTitleOverride: `Status history for referral to ${coursePresenter.displayName}`,
        person,
        referral,
        subNavigationItems,
        timelineItems,
      })

      expect(referralService.getReferral).toHaveBeenCalledWith(username, referral.id, {})
      expect(courseService.getCourseByOffering).toHaveBeenCalledWith(username, referral.offeringId)
      expect(referralService.getReferralStatusHistory).toHaveBeenCalledWith(userToken, username, referral.id)
      expect(referralService.getStatusTransitions).toHaveBeenCalledWith(username, referral.id)
      expect(personService.getPerson).toHaveBeenCalledWith(username, referral.prisonNumber)
      expect(mockShowReferralUtils.subNavigationItems).toHaveBeenCalledWith(
        `/refer/referrals/${referral.id}/status-history`,
        'statusHistory',
        referral.id,
      )
      expect(mockShowReferralUtils.buttons).toHaveBeenCalledWith(
        { currentPath: request.path, recentCaseListPath },
        referral,
        statusTransitions,
        course,
      )
      expect(mockShowReferralUtils.statusHistoryTimelineItems).toHaveBeenCalledWith(
        referralStatusHistory,
        undefined,
        undefined,
      )
    })
    it('should render the show template with the previous referral link when the referral has a previous referral Id', async () => {
      request.params = { referralId: transferredReferral.id }
      request.path = assessPaths.show.statusHistory({ referralId: transferredReferral.id })
      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(referralService.getReferral).toHaveBeenCalledWith(username, originalReferral.id)
      expect(courseService.getCourseByOffering).toHaveBeenCalledWith(username, originalReferral.offeringId)
      expect(mockShowReferralUtils.subNavigationItems).toHaveBeenCalledWith(
        `/assess/referrals/${transferredReferral.id}/status-history`,
        'statusHistory',
        transferredReferral.id,
      )
      expect(mockShowReferralUtils.statusHistoryTimelineItems).toHaveBeenCalledWith(
        referralStatusHistory,
        assessPaths.show.statusHistory({ referralId: transferredReferral.originalReferralId! }),
        course.name,
      )
      expect(mockShowReferralUtils.statusHistoryTimelineItems).toHaveBeenCalledWith(
        referralStatusHistory,
        undefined,
        undefined,
      )
    })
    it('should render the show template with the previous referral link when the referral has a previous referral Id', async () => {
      request.params = { referralId: transferredReferral.id }
      request.path = assessPaths.show.statusHistory({ referralId: transferredReferral.id })
      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(referralService.getReferral).toHaveBeenCalledWith(username, originalReferral.id)
      expect(courseService.getCourseByOffering).toHaveBeenCalledWith(username, originalReferral.offeringId)
      expect(mockShowReferralUtils.subNavigationItems).toHaveBeenCalledWith(
        `/assess/referrals/${transferredReferral.id}/status-history`,
        'statusHistory',
        transferredReferral.id,
      )
      expect(mockShowReferralUtils.statusHistoryTimelineItems).toHaveBeenCalledWith(
        referralStatusHistory,
        assessPaths.show.statusHistory({ referralId: transferredReferral.originalReferralId! }),
        course.name,
      )
    })

    it('should reset the `referralStatusUpdateData` session data', async () => {
      request.session.referralStatusUpdateData = { referralId: referral.id }

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
        expect(mockShowReferralUtils.buttons).toHaveBeenCalledWith(
          { currentPath: request.path, recentCaseListPath },
          referral,
          undefined,
          course,
        )
      })
    })
  })
})
