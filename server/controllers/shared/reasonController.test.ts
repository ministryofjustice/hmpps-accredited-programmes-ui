import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import ReasonController from './reasonController'
import type { ReferralStatusUpdateSessionData } from '../../@types/express'
import { assessPaths, referPaths } from '../../paths'
import type { PersonService, ReferenceDataService, ReferralService } from '../../services'
import {
  personFactory,
  referralFactory,
  referralStatusHistoryFactory,
  referralStatusReasonFactory,
} from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import { FormUtils, ReferralUtils, ShowReferralUtils } from '../../utils'
import type { Person } from '@accredited-programmes/models'
import type { MojTimelineItem, ReferralStatusHistoryPresenter } from '@accredited-programmes/ui'
import type { Referral, ReferralStatusReason } from '@accredited-programmes-api'
import type { GovukFrontendFieldsetLegend, GovukFrontendRadiosItem } from '@govuk-frontend'

jest.mock('../../utils/formUtils')
jest.mock('../../utils/referrals/referralUtils')
jest.mock('../../utils/referrals/showReferralUtils')

const mockReferralUtils = ReferralUtils as jest.Mocked<typeof ReferralUtils>
const mockShowReferralUtils = ShowReferralUtils as jest.Mocked<typeof ShowReferralUtils>

describe('ReasonController', () => {
  const userToken = 'SOME_TOKEN'
  const username = 'USERNAME'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const personService = createMock<PersonService>({})
  const referenceDataService = createMock<ReferenceDataService>({})
  const referralService = createMock<ReferralService>({})

  let person: Person
  const radioItems: Array<GovukFrontendRadiosItem> = [
    { text: 'Reason A', value: 'STATUS-REASON-A' },
    { text: 'Reason B', value: 'STATUS-REASON-B' },
  ]
  const reasonsFieldsets: Array<{
    legend: GovukFrontendFieldsetLegend
    radios: Array<GovukFrontendRadiosItem>
    testId: string
  }> = [
    {
      legend: { text: 'Choose reason' },
      radios: radioItems,
      testId: 'STATUS-CAT-A-reason-options',
    },
  ]
  const groupedReasons = {
    'STATUS-CAT-A': [
      { code: 'STATUS-REASON-A', description: 'Reason A', referralCategoryCode: 'STATUS-CAT-A' },
      { code: 'STATUS-REASON-B', description: 'Reason B', referralCategoryCode: 'STATUS-CAT-A' },
    ],
  }
  const timelineItems: Array<MojTimelineItem> = [
    {
      byline: { text: 'Test User' },
      datetime: { timestamp: new Date().toISOString(), type: 'datetime' },
      html: 'html',
      label: { text: 'Referral submitted' },
    },
    {
      byline: { text: 'Test User' },
      datetime: { timestamp: new Date().toISOString(), type: 'datetime' },
      html: 'html',
      label: { text: 'Referral started' },
    },
  ]
  let referral: Referral
  let referralStatusCodeReasons: Array<ReferralStatusReason>
  let referralStatusHistory: Array<ReferralStatusHistoryPresenter>
  let referralStatusUpdateData: ReferralStatusUpdateSessionData

  let controller: ReasonController

  beforeEach(() => {
    person = personFactory.build()
    referral = referralFactory.submitted().build({ prisonNumber: person.prisonNumber })
    referralStatusCodeReasons = referralStatusReasonFactory.buildList(2, { referralCategoryCode: 'A' })
    referralStatusHistory = [{ ...referralStatusHistoryFactory.started().build(), byLineText: 'You' }]
    referralStatusUpdateData = {
      decisionForCategoryAndReason: 'DESELECTED',
      finalStatusDecision: 'ASSESSED_SUITABLE',
      initialStatusDecision: 'DESELECTED',
      referralId: referral.id,
      statusCategoryCode: 'STATUS-CAT-A',
    }
    mockReferralUtils.groupReasonsByCategory.mockReturnValue(groupedReasons)
    mockReferralUtils.createReasonsFieldset.mockReturnValue(reasonsFieldsets)
    mockShowReferralUtils.statusHistoryTimelineItems.mockReturnValue(timelineItems)

    personService.getPerson.mockResolvedValue(person)
    referralService.getReferral.mockResolvedValue(referral)
    referralService.getReferralStatusHistory.mockResolvedValue(referralStatusHistory)
    referenceDataService.getReferralStatusCodeReasonsWithCategory.mockResolvedValue(referralStatusCodeReasons)

    controller = new ReasonController(personService, referenceDataService, referralService)

    request = createMock<Request>({
      params: { referralId: referral.id },
      path: referPaths.updateStatus.reason.show({ referralId: referral.id }),
      session: { referralStatusUpdateData },
      user: { token: userToken, username },
    })
    response = Helpers.createMockResponseWithCaseloads()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('show', () => {
    it('should render the show template with the correct response locals', async () => {
      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/updateStatus/reason/show', {
        backLinkHref: referPaths.show.statusHistory({ referralId: referral.id }),
        pageDescription: 'Deselecting someone means they cannot continue the programme. The referral will be closed.',
        pageHeading: 'Deselection reason',
        person,
        reasonsFieldsets,
        showOther: true,
        timelineItems: timelineItems.slice(0, 1),
      })

      expect(referenceDataService.getReferralStatusCodeReasonsWithCategory).toHaveBeenCalledWith(
        username,
        'DESELECTED',
        { deselectAndKeepOpen: false },
      )
      expect(referralService.getReferral).toHaveBeenCalledWith(username, referral.id)
      expect(referralService.getReferralStatusHistory).toHaveBeenCalledWith(userToken, username, referral.id)
      expect(personService.getPerson).toHaveBeenCalledWith(username, referral.prisonNumber)

      expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['reasonCode'])
      expect(ReferralUtils.groupReasonsByCategory).toHaveBeenCalledWith(referralStatusCodeReasons)
      expect(ReferralUtils.createReasonsFieldset).toHaveBeenCalledWith(groupedReasons, undefined)
      expect(ShowReferralUtils.statusHistoryTimelineItems).toHaveBeenCalledWith(referralStatusHistory)
    })

    describe('when the request path is on the assess journey', () => {
      it('should render the show template with the correct response locals', async () => {
        request.path = assessPaths.updateStatus.reason.show({ referralId: referral.id })

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'referrals/updateStatus/reason/show',
          expect.objectContaining({
            backLinkHref: assessPaths.show.statusHistory({ referralId: referral.id }),
          }),
        )
      })
    })

    describe('when status decision is `WITHDRAWN', () => {
      it('should render the show template with the correct response locals', async () => {
        request.session.referralStatusUpdateData = {
          ...referralStatusUpdateData,
          decisionForCategoryAndReason: 'WITHDRAWN',
          initialStatusDecision: 'WITHDRAWN',
        }

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('referrals/updateStatus/reason/show', {
          backLinkHref: referPaths.show.statusHistory({ referralId: referral.id }),
          pageDescription: 'If you withdraw the referral, it will be closed.',
          pageHeading: 'Withdrawal reason',
          person,
          reasonsFieldsets,
          showOther: true,
          timelineItems: timelineItems.slice(0, 1),
        })

        expect(referenceDataService.getReferralStatusCodeReasonsWithCategory).toHaveBeenCalledWith(
          username,
          'WITHDRAWN',
          { deselectAndKeepOpen: false },
        )
        expect(referralService.getReferralStatusHistory).toHaveBeenCalledWith(userToken, username, referral.id)

        expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['reasonCode'])
        expect(ReferralUtils.groupReasonsByCategory).toHaveBeenCalledWith(referralStatusCodeReasons)
        expect(ReferralUtils.createReasonsFieldset).toHaveBeenCalledWith(groupedReasons, undefined)
        expect(ShowReferralUtils.statusHistoryTimelineItems).toHaveBeenCalledWith(referralStatusHistory)
      })
    })

    describe('when status decision is `DESELECTED|OPEN', () => {
      it('should render the show template with the correct response locals', async () => {
        request.session.referralStatusUpdateData = {
          ...referralStatusUpdateData,
          initialStatusDecision: 'DESELECTED|OPEN',
        }

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('referrals/updateStatus/reason/show', {
          backLinkHref: referPaths.show.statusHistory({ referralId: referral.id }),
          pageDescription:
            'Deselecting someone means they cannot continue the programme. The referral will stay open until they can rejoin or restart the programme.',
          pageHeading: 'Deselection reason',
          person,
          reasonsFieldsets,
          showOther: true,
          timelineItems: timelineItems.slice(0, 1),
        })

        expect(referenceDataService.getReferralStatusCodeReasonsWithCategory).toHaveBeenCalledWith(
          username,
          'DESELECTED',
          { deselectAndKeepOpen: true },
        )
        expect(referralService.getReferralStatusHistory).toHaveBeenCalledWith(userToken, username, referral.id)

        expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['reasonCode'])
        expect(ReferralUtils.groupReasonsByCategory).toHaveBeenCalledWith(referralStatusCodeReasons)
        expect(ReferralUtils.createReasonsFieldset).toHaveBeenCalledWith(groupedReasons, undefined)
        expect(ShowReferralUtils.statusHistoryTimelineItems).toHaveBeenCalledWith(referralStatusHistory)
      })
    })

    describe('when the status decision is `ASSESSED_SUITABLE`', () => {
      it('should render the show template with the correct response locals', async () => {
        request.session.referralStatusUpdateData = {
          ...referralStatusUpdateData,
          decisionForCategoryAndReason: 'ASSESSED_SUITABLE',
          initialStatusDecision: 'ASSESSED_SUITABLE',
        }

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('referrals/updateStatus/reason/show', {
          backLinkHref: referPaths.show.statusHistory({ referralId: referral.id }),
          pageDescription:
            'This referral does not match the recommended programme pathway based on the risk and programme needs identifier (PNI) scores.',
          pageHeading: 'Reason why the referral does not match the PNI',
          person,
          reasonsFieldsets,
          showOther: false,
          timelineItems: timelineItems.slice(0, 1),
        })

        expect(referenceDataService.getReferralStatusCodeReasonsWithCategory).toHaveBeenCalledWith(
          username,
          'ASSESSED_SUITABLE',
          { deselectAndKeepOpen: false },
        )
        expect(referralService.getReferralStatusHistory).toHaveBeenCalledWith(userToken, username, referral.id)

        expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['reasonCode'])
        expect(ReferralUtils.groupReasonsByCategory).toHaveBeenCalledWith(referralStatusCodeReasons)
        expect(ReferralUtils.createReasonsFieldset).toHaveBeenCalledWith(groupedReasons, undefined)
        expect(ShowReferralUtils.statusHistoryTimelineItems).toHaveBeenCalledWith(referralStatusHistory)
      })
    })

    describe('when there is  no `referralStatusUpdateData`', () => {
      it('should redirect to the status history page', async () => {
        delete request.session.referralStatusUpdateData

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(referPaths.show.statusHistory({ referralId: referral.id }))
      })
    })

    describe('when `referralStatusUpdateData.referralId` is for a different referral', () => {
      it('should redirect to the status history page', async () => {
        request.session.referralStatusUpdateData = {
          ...referralStatusUpdateData,
          referralId: 'ANOTHER-REFERRAL',
        }

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(referPaths.show.statusHistory({ referralId: referral.id }))
      })
    })

    describe('when there is no `referralStatusUpdateData.decisionForCategoryAndReason` value', () => {
      it('should redirect to the status history page', async () => {
        delete request.session.referralStatusUpdateData?.decisionForCategoryAndReason

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(referPaths.show.statusHistory({ referralId: referral.id }))
      })
    })

    describe('when the status decision does not require a category selection', () => {
      it('should redirect to the status history page', async () => {
        request.session.referralStatusUpdateData = {
          ...referralStatusUpdateData,
          decisionForCategoryAndReason: 'AWAITING_ASSESSMENT',
          initialStatusDecision: 'AWAITING_ASSESSMENT',
        }

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(referPaths.show.statusHistory({ referralId: referral.id }))
      })
    })
  })

  describe('submit', () => {
    beforeEach(() => {
      request.body = { reasonCode: 'STATUS-REASON-A' }

      referenceDataService.getReferralStatusCodeReasonsWithCategory.mockResolvedValue([
        ...referralStatusCodeReasons,
        referralStatusReasonFactory.build({ code: 'STATUS-REASON-A', referralCategoryCode: 'STATUS-CAT-A' }),
      ])
    })

    it('should update `referralStatusUpdateData` and redirect to refer selection page', async () => {
      const requestHandler = controller.submit()
      await requestHandler(request, response, next)

      expect(request.session.referralStatusUpdateData).toEqual({
        ...referralStatusUpdateData,
        statusReasonCode: 'STATUS-REASON-A',
      })
      expect(referenceDataService.getReferralStatusCodeReasonsWithCategory).toHaveBeenCalledWith(username, 'DESELECTED')
      expect(response.redirect).toHaveBeenCalledWith(
        referPaths.updateStatus.selection.show({ referralId: referral.id }),
      )
    })

    describe('when submitting the form on the assess journey', () => {
      it('should update `referralStatusUpdateData` and redirect to the assess selection page', async () => {
        request.path = assessPaths.updateStatus.reason.show({ referralId: referral.id })

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(request.session.referralStatusUpdateData).toEqual({
          ...referralStatusUpdateData,
          statusReasonCode: 'STATUS-REASON-A',
        })
        expect(response.redirect).toHaveBeenCalledWith(
          assessPaths.updateStatus.selection.show({ referralId: referral.id }),
        )
      })
    })

    describe('when there is no `referralStatusUpdateData`', () => {
      it('should redirect to the status history page', async () => {
        delete request.session.referralStatusUpdateData

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(referPaths.show.statusHistory({ referralId: referral.id }))
      })
    })

    describe('when there is no `referralStatusUpdateData.decisionForCategoryAndReason` value', () => {
      it('should redirect to the status history page', async () => {
        delete request.session.referralStatusUpdateData?.decisionForCategoryAndReason

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(referPaths.show.statusHistory({ referralId: referral.id }))
      })
    })

    describe('when there is no `reasonCode` value is in the request body', () => {
      it('should redirect back to the reason show page with a flash message', async () => {
        request.body = { reasonCode: '' }

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(referPaths.updateStatus.reason.show({ referralId: referral.id }))
        expect(request.flash).toHaveBeenCalledWith('reasonCodeError', 'Select a deselection reason')
      })
    })

    describe('when the initialStatusDecision is `DESELECTED|OPEN`', () => {
      it('should redirect to the decision show page with a `deselectAndKeepOpen` query param set to `true`', async () => {
        request.session.referralStatusUpdateData = {
          ...referralStatusUpdateData,
          initialStatusDecision: 'DESELECTED|OPEN',
        }

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(
          `${assessPaths.updateStatus.decision.show({ referralId: referral.id })}?deselectAndKeepOpen=true`,
        )
      })
    })

    describe('when `reasonCode` is `OTHER`', () => {
      describe('and the status decision is `DESELECTED`', () => {
        it('should update `referralStatusUpdateData` with the correct category code and reason code', async () => {
          request.body = { reasonCode: 'OTHER' }

          const requestHandler = controller.submit()
          await requestHandler(request, response, next)

          expect(request.session.referralStatusUpdateData).toEqual({
            ...referralStatusUpdateData,
            statusCategoryCode: 'D_OTHER',
            statusReasonCode: undefined,
          })
        })
      })

      describe('and the status decision is `WITHDRAWN`', () => {
        it('should update `referralStatusUpdateData` with the correct category code and reason code', async () => {
          request.body = { reasonCode: 'OTHER' }
          request.session.referralStatusUpdateData = {
            ...referralStatusUpdateData,
            decisionForCategoryAndReason: 'WITHDRAWN',
          }

          const requestHandler = controller.submit()
          await requestHandler(request, response, next)

          expect(request.session.referralStatusUpdateData).toEqual({
            ...referralStatusUpdateData,
            decisionForCategoryAndReason: 'WITHDRAWN',
            statusCategoryCode: 'W_OTHER',
            statusReasonCode: undefined,
          })
        })
      })
    })
  })
})
