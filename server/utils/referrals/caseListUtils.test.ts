import CaseListUtils from './caseListUtils'
import { courseFactory, referralSummaryFactory } from '../../testutils/factories'
import FormUtils from '../formUtils'
import type { ReferralStatus } from '@accredited-programmes/models'

jest.mock('../formUtils')

describe('CaseListUtils', () => {
  describe('audienceSelectItems', () => {
    const expectedItems = {
      'extremism offence': 'Extremism offence',
      'gang offence': 'Gang offence',
      'general offence': 'General offence',
      'general violence offence': 'General violence offence',
      'intimate partner violence offence': 'Intimate partner violence offence',
      'sexual offence': 'Sexual offence',
    }

    it('makes a call to the `FormUtils.getSelectItems` method with an `undefined` `selectedValue` parameter', () => {
      CaseListUtils.audienceSelectItems()

      expect(FormUtils.getSelectItems).toHaveBeenCalledWith(expectedItems, undefined)
    })

    describe('when a selected value is provided', () => {
      it('makes a call to the `FormUtils.getSelectItems` method with the correct `selectedValue` parameter', () => {
        CaseListUtils.audienceSelectItems('general offence')

        expect(FormUtils.getSelectItems).toHaveBeenCalledWith(expectedItems, 'general offence')
      })
    })
  })

  describe('caseListPrimaryNavigationItems', () => {
    it('returns primary navigation items, with no duplicate course names, sorted alphabetically by course name and sets the correct item as active', () => {
      const courses = [
        courseFactory.build({ name: 'Lime Course' }),
        courseFactory.build({ name: 'Orange Course' }),
        courseFactory.build({ name: 'Blue Course' }),
      ]

      expect(
        CaseListUtils.caseListPrimaryNavigationItems('/assess/referrals/orange-course/case-list', courses),
      ).toEqual([
        {
          active: false,
          href: '/assess/referrals/blue-course/case-list',
          text: 'Blue Course referrals',
        },
        {
          active: false,
          href: '/assess/referrals/lime-course/case-list',
          text: 'Lime Course referrals',
        },
        {
          active: true,
          href: '/assess/referrals/orange-course/case-list',
          text: 'Orange Course referrals',
        },
      ])
    })
  })

  describe('caseListTableRows', () => {
    it('formats referral summary information in the appropriate format for passing to a GOV.UK table Nunjucks macro', () => {
      const referralSummaries = [
        referralSummaryFactory.build({
          audiences: ['General offence'],
          courseName: 'Test Course 1',
          id: 'referral-123',
          prisonNumber: 'ABC1234',
          status: 'referral_started',
          submittedOn: undefined,
        }),
        referralSummaryFactory.build({
          audiences: ['General offence', 'Extremism offence'],
          courseName: 'Test Course 2',
          id: 'referral-456',
          prisonNumber: 'DEF1234',
          status: 'referral_submitted',
          submittedOn: new Date('2021-01-01T00:00:00.000000').toISOString(),
        }),
      ]

      expect(CaseListUtils.caseListTableRows(referralSummaries)).toEqual([
        [
          {
            attributes: { 'data-sort-value': 'ABC1234' },
            html: '<a class="govuk-link" href="/assess/referrals/referral-123/personal-details">ABC1234</a>',
          },
          {
            attributes: { 'data-sort-value': undefined },
            text: 'N/A',
          },
          { text: 'Test Course 1' },
          {
            text: 'General offence',
          },
          {
            attributes: { 'data-sort-value': 'referral_started' },
            html: CaseListUtils.statusTagHtml('referral_started'),
          },
        ],
        [
          {
            attributes: { 'data-sort-value': 'DEF1234' },
            html: '<a class="govuk-link" href="/assess/referrals/referral-456/personal-details">DEF1234</a>',
          },
          {
            attributes: { 'data-sort-value': '2021-01-01T00:00:00.000Z' },
            text: '1 January 2021',
          },
          { text: 'Test Course 2' },
          {
            text: 'General offence, Extremism offence',
          },
          {
            attributes: { 'data-sort-value': 'referral_submitted' },
            html: CaseListUtils.statusTagHtml('referral_submitted'),
          },
        ],
      ])
    })
  })

  describe('statusSelectItems', () => {
    const expectedItems = {
      'assessment started': 'Assessment started',
      'awaiting assessment': 'Awaiting assessment',
      'referral started': 'Referral started',
      'referral submitted': 'Referral submitted',
    }

    it('makes a call to the `FormUtils.getSelectItems` method with an `undefined` `selectedValue` parameter', () => {
      CaseListUtils.statusSelectItems()

      expect(FormUtils.getSelectItems).toHaveBeenCalledWith(expectedItems, undefined)
    })

    describe('when a selected value is provided', () => {
      it('makes a call to the `FormUtils.getSelectItems` method with the correct `selectedValue` parameter', () => {
        CaseListUtils.statusSelectItems('referral submitted')

        expect(FormUtils.getSelectItems).toHaveBeenCalledWith(expectedItems, 'referral submitted')
      })
    })
  })

  describe('statusTagHtml', () => {
    it.each([
      ['assessment_started', 'yellow', 'Assessment started'],
      ['awaiting_assessment', 'orange', 'Awaiting assessment'],
      ['referral_submitted', 'red', 'Referral submitted'],
      ['referral_started', 'grey', 'referral_started'],
    ])(
      'should return the correct HTML for status "%s"',
      (status: string, expectedColour: string, expectedText: string) => {
        const result = CaseListUtils.statusTagHtml(status as ReferralStatus)

        expect(result).toBe(`<strong class="govuk-tag govuk-tag--${expectedColour}">${expectedText}</strong>`)
      },
    )
  })

  describe('uiToApiAudienceQueryParam', () => {
    it('returns the UI query param formatted to match the API data', () => {
      expect(CaseListUtils.uiToApiAudienceQueryParam('general violence offence')).toEqual('General violence offence')
    })

    describe('when the param is falsey', () => {
      it('returns `undefined`', () => {
        expect(CaseListUtils.uiToApiAudienceQueryParam(undefined)).toEqual(undefined)
      })
    })
  })

  describe('uiToApiStatusQueryParam', () => {
    it('returns the UI query param formatted to match the API data', () => {
      expect(CaseListUtils.uiToApiStatusQueryParam('referral submitted')).toEqual('REFERRAL_SUBMITTED')
    })

    describe('when the param is falsey', () => {
      it('returns `undefined`', () => {
        expect(CaseListUtils.uiToApiStatusQueryParam(undefined)).toEqual(undefined)
      })
    })
  })
})
