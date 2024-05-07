import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { when } from 'jest-when'

import UpdateStatusDecisionController from './updateStatusDecisionController'
import type { ReferralStatusUpdateSessionData } from '../../@types/express'
import { assessPaths } from '../../paths'
import type { PersonService, ReferralService } from '../../services'
import {
  personFactory,
  referralFactory,
  referralStatusHistoryFactory,
  referralStatusRefDataFactory,
} from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import { FormUtils, ReferralUtils, ShowReferralUtils } from '../../utils'
import type { Person, Referral, ReferralStatusRefData } from '@accredited-programmes/models'
import type { MojTimelineItem, ReferralStatusHistoryPresenter } from '@accredited-programmes/ui'
import type { GovukFrontendRadiosItem } from '@govuk-frontend'

jest.mock('../../utils/formUtils')
jest.mock('../../utils/referrals/referralUtils')
jest.mock('../../utils/referrals/showReferralUtils')

const mockedFormUtils = FormUtils as jest.Mocked<typeof FormUtils>
const mockReferralUtils = ReferralUtils as jest.Mocked<typeof ReferralUtils>
const mockShowReferralUtils = ShowReferralUtils as jest.Mocked<typeof ShowReferralUtils>

describe('UpdateStatusDecisionController', () => {
  const userToken = 'SOME_TOKEN'
  const username = 'USERNAME'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const personService = createMock<PersonService>({})
  const referralService = createMock<ReferralService>({})

  let person: Person
  const radioItems: Array<GovukFrontendRadiosItem> = [
    { text: 'Status A', value: 'STATUS-A' },
    { text: 'Status B', value: 'STATUS-B' },
  ]
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
  let referralStatusHistory: Array<ReferralStatusHistoryPresenter>
  let referralStatusTransitions: Array<ReferralStatusRefData>

  let controller: UpdateStatusDecisionController

  beforeEach(() => {
    person = personFactory.build()
    referral = referralFactory.submitted().build({ prisonNumber: person.prisonNumber })
    referralStatusHistory = [{ ...referralStatusHistoryFactory.submitted().build(), byLineText: 'You' }]
    referralStatusTransitions = [
      referralStatusRefDataFactory.build({ code: 'AWAITING_ASSESSMENT' }),
      referralStatusRefDataFactory.build({ code: 'NOT_SUITABLE' }),
    ]
    mockReferralUtils.statusOptionsToRadioItems.mockReturnValue(radioItems)
    mockShowReferralUtils.statusHistoryTimelineItems.mockReturnValue(timelineItems)

    personService.getPerson.mockResolvedValue(person)
    referralService.getReferral.mockResolvedValue(referral)
    referralService.getReferralStatusHistory.mockResolvedValue(referralStatusHistory)
    referralService.getStatusTransitions.mockResolvedValue(referralStatusTransitions)

    controller = new UpdateStatusDecisionController(personService, referralService)

    request = createMock<Request>({
      params: { referralId: referral.id },
      path: assessPaths.updateStatus.decision.show({ referralId: referral.id }),
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

      expect(response.render).toHaveBeenCalledWith('referrals/updateStatus/decision/show', {
        backLinkHref: assessPaths.show.statusHistory({ referralId: referral.id }),
        confirmationText: {
          primaryDescription: 'Record all decisions to keep the status up to date.',
          primaryHeading: 'Update referral status',
          secondaryDescription: null,
          secondaryHeading: 'Select decision',
        },
        pageHeading: 'Update referral status',
        person,
        radioItems,
        timelineItems: timelineItems.slice(0, 1),
      })

      expect(mockedFormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['statusDecision'])
      expect(mockReferralUtils.statusOptionsToRadioItems).toHaveBeenCalledWith(referralStatusTransitions, undefined)
      expect(mockShowReferralUtils.statusHistoryTimelineItems).toHaveBeenCalledWith(referralStatusHistory)

      expect(referralService.getReferral).toHaveBeenCalledWith(username, referral.id)
      expect(referralService.getReferralStatusHistory).toHaveBeenCalledWith(userToken, username, referral.id)
      expect(referralService.getStatusTransitions).toHaveBeenCalledWith(username, referral.id, {
        deselectAndKeepOpen: false,
        ptUser: true,
      })
      expect(referralService.getConfirmationText).not.toHaveBeenCalled()
      expect(personService.getPerson).toHaveBeenCalledWith(
        username,
        referral.prisonNumber,
        response.locals.user.caseloads,
      )
    })

    describe('when the available status transitions have a `deselectAndKeepOpen` property', () => {
      it('should append `|OPEN` to the `code` property of the status transition', async () => {
        const onProgrammeTransition = referralStatusRefDataFactory.build({ code: 'ON_PROGRAMME' })
        const deselectCloseTransition = referralStatusRefDataFactory.build({ code: 'DESELECTED' })
        const deselectOpenTransition = referralStatusRefDataFactory.build({
          code: 'DESELECTED',
          deselectAndKeepOpen: true,
        })
        const statusTransitions = [onProgrammeTransition, deselectCloseTransition, deselectOpenTransition]
        referralService.getStatusTransitions.mockResolvedValue(statusTransitions)

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(mockReferralUtils.statusOptionsToRadioItems).toHaveBeenCalledWith(
          [onProgrammeTransition, deselectCloseTransition, { ...deselectOpenTransition, code: 'DESELECTED|OPEN' }],
          undefined,
        )
      })
    })

    describe('when `referralStatusUpdateData` is for the same referral and contains `initialStatusDecision`', () => {
      it('should keep `referralStatusUpdateData` in the session and make the call to check the correct radio item', async () => {
        const session: ReferralStatusUpdateSessionData = {
          initialStatusDecision: 'NOT_SUITABLE',
          referralId: referral.id,
        }
        request.session.referralStatusUpdateData = session

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(request.session.referralStatusUpdateData).toEqual(session)
        expect(mockReferralUtils.statusOptionsToRadioItems).toHaveBeenCalledWith(
          referralStatusTransitions,
          'NOT_SUITABLE',
        )
      })
    })

    describe('when `referralStatusUpdateData` is for a different referral', () => {
      it('should remove `referralStatusUpdateData` from the session', async () => {
        request.session.referralStatusUpdateData = {
          initialStatusDecision: 'WITHDRAWN',
          referralId: 'DIFFERENT_REFERRAL_ID',
        }

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(request.session.referralStatusUpdateData).toBeUndefined()
        expect(mockReferralUtils.statusOptionsToRadioItems).toHaveBeenCalledWith(referralStatusTransitions, undefined)
      })
    })

    describe('when on the deselect and open journey', () => {
      describe('and viewing the initial decision step of `DESELECTED|OPEN`', () => {
        it('should make the call to check the correct radio item', async () => {
          const session: ReferralStatusUpdateSessionData = {
            finalStatusDecision: 'DESELECTED',
            initialStatusDecision: 'DESELECTED|OPEN',
            referralId: referral.id,
          }
          request.session.referralStatusUpdateData = session

          const requestHandler = controller.show()
          await requestHandler(request, response, next)

          expect(request.session.referralStatusUpdateData).toEqual(session)
          expect(mockReferralUtils.statusOptionsToRadioItems).toHaveBeenCalledWith(
            referralStatusTransitions,
            'DESELECTED|OPEN',
          )
          expect(referralService.getConfirmationText).not.toHaveBeenCalled()
        })
      })

      describe('and viewing the final decision step of `ASSESSED_SUITABLE`', () => {
        it('should call `getConfirmationText`, call to check the correct radio item and render the template with the correct response locals', async () => {
          const confirmationText = {
            hasConfirmation: false,
            primaryDescription:
              'This person cannot complete the programme now. They may be able to join or restart in the future.',
            primaryHeading: 'Deselection: keep referral open',
            secondaryDescription:
              'The referral will be paused at this status, for example Deselected - assessed as suitable.',
            secondaryHeading: 'Choose the deselection status',
            warningText: '',
          }
          const session: ReferralStatusUpdateSessionData = {
            finalStatusDecision: 'ASSESSED_SUITABLE',
            initialStatusDecision: 'DESELECTED|OPEN',
            referralId: referral.id,
          }
          request.session.referralStatusUpdateData = session
          request.query = { deselectAndKeepOpen: 'true' }

          when(referralService.getConfirmationText)
            .calledWith(username, referral.id, 'DESELECTED', {
              deselectAndKeepOpen: true,
              ptUser: true,
            })
            .mockResolvedValue(confirmationText)

          const requestHandler = controller.show()
          await requestHandler(request, response, next)

          expect(response.render).toHaveBeenCalledWith('referrals/updateStatus/decision/show', {
            backLinkHref: assessPaths.show.statusHistory({ referralId: referral.id }),
            confirmationText,
            pageHeading: confirmationText.primaryHeading,
            person,
            radioItems,
            timelineItems: timelineItems.slice(0, 1),
          })

          expect(request.session.referralStatusUpdateData).toEqual(session)
          expect(mockReferralUtils.statusOptionsToRadioItems).toHaveBeenCalledWith(
            referralStatusTransitions,
            'ASSESSED_SUITABLE',
          )
        })
      })
    })
  })

  describe('submit', () => {
    beforeEach(() => {
      request.body = { statusDecision: 'NOT_SUITABLE' }
    })

    it('should update `referralStatusUpdateData` and redirect to the update status selection show page', async () => {
      const requestHandler = controller.submit()
      await requestHandler(request, response, next)

      expect(request.session.referralStatusUpdateData).toEqual({
        decisionForCategoryAndReason: 'NOT_SUITABLE',
        finalStatusDecision: 'NOT_SUITABLE',
        initialStatusDecision: 'NOT_SUITABLE',
        referralId: referral.id,
      })
      expect(response.redirect).toHaveBeenCalledWith(
        assessPaths.updateStatus.selection.show({ referralId: referral.id }),
      )
    })

    describe('when there is no `statusDecision` value in the request body', () => {
      it('should redirect back to the decision page with a flash message', async () => {
        request.body = {}

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(request.flash).toHaveBeenCalledWith('statusDecisionError', 'Select a status decision')
        expect(response.redirect).toHaveBeenCalledWith(
          assessPaths.updateStatus.decision.show({ referralId: referral.id }),
        )
      })
    })

    describe('when `statusDecision` is `WITHDRAWN`', () => {
      it('should redirect to the category page show page', async () => {
        request.body = { statusDecision: 'WITHDRAWN' }

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(request.session.referralStatusUpdateData).toEqual({
          decisionForCategoryAndReason: 'WITHDRAWN',
          finalStatusDecision: 'WITHDRAWN',
          initialStatusDecision: 'WITHDRAWN',
          referralId: referral.id,
        })
        expect(response.redirect).toHaveBeenCalledWith(
          assessPaths.updateStatus.category.show({ referralId: referral.id }),
        )
      })
    })

    describe('when `statusDecision` is `DESELECTED`', () => {
      it('should redirect to the category page show page', async () => {
        request.body = { statusDecision: 'DESELECTED' }

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(request.session.referralStatusUpdateData).toEqual({
          decisionForCategoryAndReason: 'DESELECTED',
          finalStatusDecision: 'DESELECTED',
          initialStatusDecision: 'DESELECTED',
          referralId: referral.id,
        })
        expect(response.redirect).toHaveBeenCalledWith(
          assessPaths.updateStatus.category.show({ referralId: referral.id }),
        )
      })
    })

    describe('when `statusDecision` is `DESELECTED|OPEN`', () => {
      it('should set the correct `referralStatusUpdateData` values and redirect to the category page show page', async () => {
        request.body = { statusDecision: 'DESELECTED|OPEN' }

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(request.session.referralStatusUpdateData).toEqual({
          decisionForCategoryAndReason: 'DESELECTED',
          finalStatusDecision: 'DESELECTED',
          initialStatusDecision: 'DESELECTED|OPEN',
          referralId: referral.id,
        })
        expect(response.redirect).toHaveBeenCalledWith(
          assessPaths.updateStatus.category.show({ referralId: referral.id }),
        )
      })
    })

    describe('when on the deselect and open journey and making the final status decision', () => {
      it('should maintain the `decisionForCategoryAndReason` and `initialStatusDecision` values but update the `finalStatusDecision` value', async () => {
        request.session.referralStatusUpdateData = {
          decisionForCategoryAndReason: 'DESELECTED',
          finalStatusDecision: 'DESELECTED',
          initialStatusDecision: 'DESELECTED|OPEN',
          referralId: referral.id,
        }
        request.body = { statusDecision: 'ASSESSED_SUITABLE' }
        request.query = { deselectAndKeepOpen: 'true' }

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(request.session.referralStatusUpdateData).toEqual({
          decisionForCategoryAndReason: 'DESELECTED',
          finalStatusDecision: 'ASSESSED_SUITABLE',
          initialStatusDecision: 'DESELECTED|OPEN',
          referralId: referral.id,
        })
        expect(response.redirect).toHaveBeenCalledWith(
          assessPaths.updateStatus.selection.show({ referralId: referral.id }),
        )
      })
    })
  })
})
