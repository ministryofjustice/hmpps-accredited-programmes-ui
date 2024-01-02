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

  describe('primaryNavigationItems', () => {
    it('returns primary navigation items, with no duplicate course names, sorted alphabetically by course name and sets the correct item as active', () => {
      const courses = [
        courseFactory.build({ name: 'Lime Course' }),
        courseFactory.build({ name: 'Orange Course' }),
        courseFactory.build({ name: 'Blue Course' }),
      ]

      expect(CaseListUtils.primaryNavigationItems('/assess/referrals/orange-course/case-list', courses)).toEqual([
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

  describe('queryParamsExcludingPage', () => {
    const audienceQueryParam = { key: 'audience', value: 'general violence offence' }
    const statusQueryParam = { key: 'status', value: 'referral started' as ReferralStatus }

    describe('when both audience and status are provided', () => {
      it('returns an array with one `QueryParam` for each, converting audience to "strand"', async () => {
        expect(CaseListUtils.queryParamsExcludingPage(audienceQueryParam.value, statusQueryParam.value)).toEqual([
          { key: 'strand', value: audienceQueryParam.value },
          { key: 'status', value: statusQueryParam.value },
        ])
      })
    })

    describe('when audience is undefined', () => {
      it('returns an array with a status `QueryParam`', async () => {
        expect(CaseListUtils.queryParamsExcludingPage(undefined, statusQueryParam.value)).toEqual([
          { key: 'status', value: statusQueryParam.value },
        ])
      })
    })

    describe('when status is undefined', () => {
      it('returns an array with a strand `QueryParam`, converted from "audience"', async () => {
        expect(CaseListUtils.queryParamsExcludingPage(audienceQueryParam.value, undefined)).toEqual([
          { key: 'strand', value: audienceQueryParam.value },
        ])
      })
    })

    describe('when both are undefined', () => {
      it('returns an empty array', async () => {
        expect(CaseListUtils.queryParamsExcludingPage(undefined, undefined)).toEqual([])
      })
    })
  })

  describe('statusSelectItems', () => {
    const expectedItems = {
      'assessment started': 'Assessment started',
      'awaiting assessment': 'Awaiting assessment',
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

  describe('subNavigationItems', () => {
    it('returns an array of sub navigation items for my referrals', () => {
      const currentPath = '/refer/referrals/case-list/open'
      const expectedItems = [
        {
          active: true,
          href: '/refer/referrals/case-list/open',
          text: 'Open referrals',
        },
        // {
        //   active: false,
        //   href: '/refer/referrals/case-list/closed',
        //   text: 'Closed referrals',
        // },
        {
          active: false,
          href: '/refer/referrals/case-list/draft',
          text: 'Draft referrals',
        },
      ]

      expect(CaseListUtils.subNavigationItems(currentPath)).toEqual(expectedItems)
    })
  })

  describe('tableRows', () => {
    const referralSummaries = [
      referralSummaryFactory.build({
        audiences: ['General offence'],
        courseName: 'Test Course 1',
        earliestReleaseDate: new Date('2022-01-01T00:00:00.000000').toISOString(),
        id: 'referral-123',
        prisonName: 'Whatton (HMP)',
        prisonNumber: 'ABC1234',
        prisonerName: { firstName: 'DEL', lastName: 'HATTON' },
        sentence: {
          conditionalReleaseDate: new Date('2023-01-01T00:00:00.000000').toISOString(),
          nonDtoReleaseDateType: 'ARD',
          paroleEligibilityDate: new Date('2022-01-01T00:00:00.000000').toISOString(),
          tariffExpiryDate: new Date('2024-01-01T00:00:00.000000').toISOString(),
        },
        status: 'referral_started',
        submittedOn: undefined,
        tasksCompleted: 2,
      }),
      referralSummaryFactory.build({
        audiences: ['General offence', 'Extremism offence'],
        courseName: 'Test Course 2',
        earliestReleaseDate: undefined,
        id: 'referral-456',
        prisonName: undefined,
        prisonNumber: 'DEF1234',
        prisonerName: undefined,
        sentence: {},
        status: 'referral_submitted',
        submittedOn: new Date('2021-01-01T00:00:00.000000').toISOString(),
        tasksCompleted: undefined,
      }),
    ]

    it('formats referral summary information in the appropriate format for passing to a GOV.UK table Nunjucks macro', () => {
      expect(
        CaseListUtils.tableRows(referralSummaries, [
          'Conditional release date',
          'Date referred',
          'Earliest release date',
          'Name / Prison number',
          'Parole eligibility date',
          'Programme location',
          'Programme name',
          'Programme strand',
          'Progress',
          'Referral status',
          'Release date type',
          'Tariff end date',
        ]),
      ).toEqual([
        [
          {
            attributes: { 'data-sort-value': '2023-01-01T00:00:00.000Z' },
            text: '1 January 2023',
          },
          {
            attributes: { 'data-sort-value': undefined },
            text: 'N/A',
          },
          {
            attributes: { 'data-sort-value': '2022-01-01T00:00:00.000Z' },
            text: '1 January 2022',
          },
          {
            attributes: { 'data-sort-value': 'Del Hatton' },
            html: '<a class="govuk-link" href="/assess/referrals/referral-123/personal-details">Del Hatton</a><br>ABC1234',
          },
          {
            attributes: { 'data-sort-value': '2022-01-01T00:00:00.000Z' },
            text: '1 January 2022',
          },
          {
            attributes: { 'data-sort-value': 'Whatton (HMP)' },
            text: 'Whatton (HMP)',
          },
          { text: 'Test Course 1' },
          { text: 'General offence' },
          { text: '2 out of 4 tasks complete' },
          {
            attributes: { 'data-sort-value': 'referral_started' },
            html: CaseListUtils.statusTagHtml('referral_started'),
          },
          {
            attributes: { 'data-sort-value': 'ARD' },
            text: 'Automatic Release Date',
          },
          {
            attributes: { 'data-sort-value': '2024-01-01T00:00:00.000Z' },
            text: '1 January 2024',
          },
        ],
        [
          {
            attributes: { 'data-sort-value': undefined },
            text: 'N/A',
          },
          {
            attributes: { 'data-sort-value': '2021-01-01T00:00:00.000Z' },
            text: '1 January 2021',
          },
          {
            attributes: { 'data-sort-value': undefined },
            text: 'N/A',
          },
          {
            attributes: { 'data-sort-value': '' },
            html: '<a class="govuk-link" href="/assess/referrals/referral-456/personal-details">DEF1234</a>',
          },
          {
            attributes: { 'data-sort-value': undefined },
            text: 'N/A',
          },
          {
            attributes: { 'data-sort-value': undefined },
            text: 'N/A',
          },
          { text: 'Test Course 2' },
          { text: 'General offence, Extremism offence' },
          { text: '0 out of 4 tasks complete' },
          {
            attributes: { 'data-sort-value': 'referral_submitted' },
            html: CaseListUtils.statusTagHtml('referral_submitted'),
          },
          {
            attributes: { 'data-sort-value': undefined },
            text: 'N/A',
          },
          {
            attributes: { 'data-sort-value': undefined },
            text: 'N/A',
          },
        ],
      ])
    })

    it('only includes data corresponding to the given column headers', () => {
      expect(
        CaseListUtils.tableRows(referralSummaries, [
          'Conditional release date',
          'Date referred',
          'Earliest release date',
        ]),
      ).toEqual([
        [
          {
            attributes: { 'data-sort-value': '2023-01-01T00:00:00.000Z' },
            text: '1 January 2023',
          },
          {
            attributes: { 'data-sort-value': undefined },
            text: 'N/A',
          },
          {
            attributes: { 'data-sort-value': '2022-01-01T00:00:00.000Z' },
            text: '1 January 2022',
          },
        ],
        [
          {
            attributes: { 'data-sort-value': undefined },
            text: 'N/A',
          },
          {
            attributes: { 'data-sort-value': '2021-01-01T00:00:00.000Z' },
            text: '1 January 2021',
          },
          {
            attributes: { 'data-sort-value': undefined },
            text: 'N/A',
          },
        ],
      ])
    })
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
