import CaseListUtils from './caseListUtils'
import { assessPaths, referPaths } from '../../paths'
import { courseFactory, referralViewFactory } from '../../testutils/factories'
import FormUtils from '../formUtils'
import type { ReferralStatus } from '@accredited-programmes/models'
import type { CaseListColumnHeader, SortableCaseListColumnKey } from '@accredited-programmes/ui'

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
    const sortColumnQueryParam = { key: 'sortColumn', value: 'conditionalReleaseDate' }
    const sortDirectionQueryParam = { key: 'sortDirection', value: 'ascending' }

    describe('when all possible params are provided', () => {
      it('returns an array with one `QueryParam` for each, converting audience to "strand"', async () => {
        expect(
          CaseListUtils.queryParamsExcludingPage(
            audienceQueryParam.value,
            statusQueryParam.value,
            sortColumnQueryParam.value,
            sortDirectionQueryParam.value,
          ),
        ).toEqual([
          { key: 'strand', value: audienceQueryParam.value },
          { key: 'status', value: statusQueryParam.value },
          { key: 'sortColumn', value: sortColumnQueryParam.value },
          { key: 'sortDirection', value: sortDirectionQueryParam.value },
        ])
      })
    })

    describe('when only status is provided', () => {
      it('returns an array with a status `QueryParam`', async () => {
        expect(CaseListUtils.queryParamsExcludingPage(undefined, statusQueryParam.value)).toEqual([
          { key: 'status', value: statusQueryParam.value },
        ])
      })
    })

    describe('when only strand is provided', () => {
      it('returns an array with a strand `QueryParam`, converted from "audience"', async () => {
        expect(CaseListUtils.queryParamsExcludingPage(audienceQueryParam.value, undefined)).toEqual([
          { key: 'strand', value: audienceQueryParam.value },
        ])
      })
    })

    describe('when only sortColumn is provided', () => {
      it('returns an empty array', async () => {
        expect(
          CaseListUtils.queryParamsExcludingPage(undefined, undefined, sortColumnQueryParam.value, undefined),
        ).toEqual([])
      })
    })

    describe('when only sortDirection is provided', () => {
      it('returns an empty array', async () => {
        expect(
          CaseListUtils.queryParamsExcludingPage(undefined, undefined, undefined, sortDirectionQueryParam.value),
        ).toEqual([])
      })
    })

    describe('when both sortColumn and sortDirection are provided', () => {
      it('returns an array with both sort `QueryParam`s', async () => {
        expect(
          CaseListUtils.queryParamsExcludingPage(
            undefined,
            undefined,
            sortColumnQueryParam.value,
            sortDirectionQueryParam.value,
          ),
        ).toEqual([
          { key: 'sortColumn', value: sortColumnQueryParam.value },
          { key: 'sortDirection', value: sortDirectionQueryParam.value },
        ])
      })
    })

    describe('when all params are undefined', () => {
      it('returns an empty array', async () => {
        expect(CaseListUtils.queryParamsExcludingPage(undefined, undefined, undefined, undefined)).toEqual([])
      })
    })
  })

  describe('queryParamsExcludingSort', () => {
    const audienceQueryParam = { key: 'audience', value: 'general violence offence' }
    const statusQueryParam = { key: 'status', value: 'referral started' as ReferralStatus }
    const pageQueryParam = { key: 'page', value: '2' }

    describe('when all possible params are provided', () => {
      it('returns an array with one `QueryParam` for each, converting audience to "strand"', async () => {
        expect(
          CaseListUtils.queryParamsExcludingSort(
            audienceQueryParam.value,
            statusQueryParam.value,
            pageQueryParam.value,
          ),
        ).toEqual([
          { key: 'strand', value: audienceQueryParam.value },
          { key: 'status', value: statusQueryParam.value },
          { key: 'page', value: pageQueryParam.value },
        ])
      })
    })

    describe('when only status is provided', () => {
      it('returns an array with a status `QueryParam`', async () => {
        expect(CaseListUtils.queryParamsExcludingSort(undefined, statusQueryParam.value, undefined)).toEqual([
          { key: 'status', value: statusQueryParam.value },
        ])
      })
    })

    describe('when only strand is provided', () => {
      it('returns an array with a strand `QueryParam`, converted from "audience"', async () => {
        expect(CaseListUtils.queryParamsExcludingSort(audienceQueryParam.value, undefined, undefined)).toEqual([
          { key: 'strand', value: audienceQueryParam.value },
        ])
      })
    })

    describe('when only page is provided', () => {
      it('returns an array with a page `QueryParam`', async () => {
        expect(CaseListUtils.queryParamsExcludingSort(undefined, undefined, pageQueryParam.value)).toEqual([
          { key: 'page', value: pageQueryParam.value },
        ])
      })
    })

    describe('when all params are undefined', () => {
      it('returns an empty array', async () => {
        expect(CaseListUtils.queryParamsExcludingSort(undefined, undefined, undefined)).toEqual([])
      })
    })
  })

  describe('sortableTableHeadings', () => {
    /* eslint-disable sort-keys */
    const caseListColumns: Partial<Record<SortableCaseListColumnKey, CaseListColumnHeader>> = {
      surname: 'Name / Prison number',
      conditionalReleaseDate: 'Conditional release date',
      paroleEligibilityDate: 'Parole eligibility date',
      tariffExpiryDate: 'Tariff end date',
      audience: 'Programme strand',
      status: 'Referral status',
    }
    /* eslint-enable sort-keys */

    it('returns a formatted array to be used by GOV.UK Nunjucks table macro for sortable headings, wtih the default sorting set to "Name / Prison number" in `ascending` order', () => {
      expect(CaseListUtils.sortableTableHeadings('/case-list', caseListColumns)).toEqual([
        {
          attributes: { 'aria-sort': 'ascending' },
          html: '<a class="govuk-link--no-visited-state" href="/case-list?sortColumn=surname&sortDirection=descending">Name / Prison number</a>',
        },
        {
          attributes: { 'aria-sort': 'none' },
          html: '<a class="govuk-link--no-visited-state" href="/case-list?sortColumn=conditionalReleaseDate&sortDirection=ascending">Conditional release date</a>',
        },
        {
          attributes: { 'aria-sort': 'none' },
          html: '<a class="govuk-link--no-visited-state" href="/case-list?sortColumn=paroleEligibilityDate&sortDirection=ascending">Parole eligibility date</a>',
        },
        {
          attributes: { 'aria-sort': 'none' },
          html: '<a class="govuk-link--no-visited-state" href="/case-list?sortColumn=tariffExpiryDate&sortDirection=ascending">Tariff end date</a>',
        },
        {
          attributes: { 'aria-sort': 'none' },
          html: '<a class="govuk-link--no-visited-state" href="/case-list?sortColumn=audience&sortDirection=ascending">Programme strand</a>',
        },
        {
          attributes: { 'aria-sort': 'none' },
          html: '<a class="govuk-link--no-visited-state" href="/case-list?sortColumn=status&sortDirection=ascending">Referral status</a>',
        },
      ])
    })

    describe('when `sortColumn` and `sortDirection` are provided', () => {
      it('sets the correct heading with the `sortDirection` value as `aria-sort` attribute value and the `sortDirection` in the `href` is the `sortColumn` in the opposite direction', () => {
        expect(
          CaseListUtils.sortableTableHeadings('/case-list', caseListColumns, 'conditionalReleaseDate', 'descending'),
        ).toEqual([
          {
            attributes: { 'aria-sort': 'none' },
            html: '<a class="govuk-link--no-visited-state" href="/case-list?sortColumn=surname&sortDirection=ascending">Name / Prison number</a>',
          },
          {
            attributes: { 'aria-sort': 'descending' },
            html: '<a class="govuk-link--no-visited-state" href="/case-list?sortColumn=conditionalReleaseDate&sortDirection=ascending">Conditional release date</a>',
          },
          {
            attributes: { 'aria-sort': 'none' },
            html: '<a class="govuk-link--no-visited-state" href="/case-list?sortColumn=paroleEligibilityDate&sortDirection=ascending">Parole eligibility date</a>',
          },
          {
            attributes: { 'aria-sort': 'none' },
            html: '<a class="govuk-link--no-visited-state" href="/case-list?sortColumn=tariffExpiryDate&sortDirection=ascending">Tariff end date</a>',
          },
          {
            attributes: { 'aria-sort': 'none' },
            html: '<a class="govuk-link--no-visited-state" href="/case-list?sortColumn=audience&sortDirection=ascending">Programme strand</a>',
          },
          {
            attributes: { 'aria-sort': 'none' },
            html: '<a class="govuk-link--no-visited-state" href="/case-list?sortColumn=status&sortDirection=ascending">Referral status</a>',
          },
        ])
      })
    })

    describe('when the `basePath` contains a query string', () => {
      it('preserves the query string in the `href` of each heading', () => {
        expect(
          CaseListUtils.sortableTableHeadings(
            '/case-list?audience=general+offence',
            caseListColumns,
            'conditionalReleaseDate',
            'ascending',
          ),
        ).toEqual([
          {
            attributes: { 'aria-sort': 'none' },
            html: '<a class="govuk-link--no-visited-state" href="/case-list?audience=general+offence&sortColumn=surname&sortDirection=ascending">Name / Prison number</a>',
          },
          {
            attributes: { 'aria-sort': 'ascending' },
            html: '<a class="govuk-link--no-visited-state" href="/case-list?audience=general+offence&sortColumn=conditionalReleaseDate&sortDirection=descending">Conditional release date</a>',
          },
          {
            attributes: { 'aria-sort': 'none' },
            html: '<a class="govuk-link--no-visited-state" href="/case-list?audience=general+offence&sortColumn=paroleEligibilityDate&sortDirection=ascending">Parole eligibility date</a>',
          },
          {
            attributes: { 'aria-sort': 'none' },
            html: '<a class="govuk-link--no-visited-state" href="/case-list?audience=general+offence&sortColumn=tariffExpiryDate&sortDirection=ascending">Tariff end date</a>',
          },
          {
            attributes: { 'aria-sort': 'none' },
            html: '<a class="govuk-link--no-visited-state" href="/case-list?audience=general+offence&sortColumn=audience&sortDirection=ascending">Programme strand</a>',
          },
          {
            attributes: { 'aria-sort': 'none' },
            html: '<a class="govuk-link--no-visited-state" href="/case-list?audience=general+offence&sortColumn=status&sortDirection=ascending">Referral status</a>',
          },
        ])
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
    it('should return the correct HTML', () => {
      expect(CaseListUtils.statusTagHtml('green', 'Referral submitted')).toBe(
        '<strong class="govuk-tag govuk-tag--green">Referral submitted</strong>',
      )
    })

    describe('when the `statusDescription` is `undefined`', () => {
      it('returns an empty string', () => {
        expect(CaseListUtils.statusTagHtml('green', undefined)).toBe(
          '<strong class="govuk-tag govuk-tag--green">Unknown status</strong>',
        )
      })
    })
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

  describe('tableRowContent', () => {
    const referralView = referralViewFactory.build({
      audience: 'General offence',
      conditionalReleaseDate: new Date('2023-01-01T00:00:00.000000').toISOString(),
      courseName: 'Test Course',
      earliestReleaseDate: new Date('2022-01-01T00:00:00.000000').toISOString(),
      forename: 'Del',
      id: 'referral-123',
      nonDtoReleaseDateType: 'ARD',
      organisationName: 'Whatton (HMP)',
      paroleEligibilityDate: new Date('2022-01-01T00:00:00.000000').toISOString(),
      prisonNumber: 'ABC1234',
      status: 'referral_submitted',
      submittedOn: new Date('2021-01-01T00:00:00.000000').toISOString(),
      surname: 'Hatton',
      tariffExpiryDate: new Date('2024-01-01T00:00:00.000000').toISOString(),
      tasksCompleted: 4,
    })

    describe('Conditional release date', () => {
      it('returns a formatted conditional release date', () => {
        expect(CaseListUtils.tableRowContent(referralView, 'Conditional release date')).toEqual('1 January 2023')
      })

      describe('when `conditionalReleaseDate` is `undefined`', () => {
        it('returns "N/A"', () => {
          expect(
            CaseListUtils.tableRowContent(
              { ...referralView, conditionalReleaseDate: undefined },
              'Conditional release date',
            ),
          ).toEqual('N/A')
        })
      })
    })

    describe('Date referred', () => {
      it('returns a formatted submitted on date', () => {
        expect(CaseListUtils.tableRowContent(referralView, 'Date referred')).toEqual('1 January 2021')
      })

      describe('when `submittedOn` is `undefined`', () => {
        it('returns "N/A"', () => {
          expect(CaseListUtils.tableRowContent({ ...referralView, submittedOn: undefined }, 'Date referred')).toEqual(
            'N/A',
          )
        })
      })
    })

    describe('Earliest release date', () => {
      it('returns a formatted earliest release date', () => {
        expect(CaseListUtils.tableRowContent(referralView, 'Earliest release date')).toEqual('1 January 2022')
      })

      describe('when `earliestReleaseDate` is `undefined`', () => {
        it('returns "N/A"', () => {
          expect(
            CaseListUtils.tableRowContent({ ...referralView, earliestReleaseDate: undefined }, 'Earliest release date'),
          ).toEqual('N/A')
        })
      })
    })

    describe('Name / Prison number', () => {
      it('returns a HTML string with the prisoner name on the first line, which links to the referral, and their prison number on a new line', () => {
        expect(CaseListUtils.tableRowContent(referralView, 'Name / Prison number')).toEqual(
          '<a class="govuk-link" href="/assess/referrals/referral-123/personal-details?updatePerson=true">Del Hatton</a><br>ABC1234',
        )
      })

      describe('with an unsubmitted referral', () => {
        it('links to the Refer new referral show page', () => {
          expect(
            CaseListUtils.tableRowContent(
              { ...referralView, status: 'referral_started', submittedOn: undefined },
              'Name / Prison number',
              assessPaths,
            ),
          ).toEqual(
            '<a class="govuk-link" href="/refer/referrals/new/referral-123?updatePerson=true">Del Hatton</a><br>ABC1234',
          )
        })
      })

      describe('when referPaths is passed in as the paths argument', () => {
        it('links to a Refer show referral page', () => {
          expect(CaseListUtils.tableRowContent(referralView, 'Name / Prison number', referPaths)).toEqual(
            '<a class="govuk-link" href="/refer/referrals/referral-123/personal-details?updatePerson=true">Del Hatton</a><br>ABC1234',
          )
        })
      })

      describe('when `forename` and `surname` are `undefined`', () => {
        it('omits the prisoner name and adds the link to their prison number instead', () => {
          expect(
            CaseListUtils.tableRowContent(
              { ...referralView, forename: undefined, surname: undefined },
              'Name / Prison number',
            ),
          ).toEqual(
            '<a class="govuk-link" href="/assess/referrals/referral-123/personal-details?updatePerson=true">ABC1234</a>',
          )
        })
      })
    })

    describe('Parole eligibility date', () => {
      it('returns a formatted parole eligibility date', () => {
        expect(CaseListUtils.tableRowContent(referralView, 'Parole eligibility date')).toEqual('1 January 2022')
      })

      describe('when `paroleEligibilityDate` is `undefined`', () => {
        it('returns "N/A"', () => {
          expect(
            CaseListUtils.tableRowContent(
              { ...referralView, paroleEligibilityDate: undefined },
              'Parole eligibility date',
            ),
          ).toEqual('N/A')
        })
      })
    })

    describe('Programme location', () => {
      it('returns the organisation name', () => {
        expect(CaseListUtils.tableRowContent(referralView, 'Programme location')).toEqual('Whatton (HMP)')
      })

      describe('when `organisationName` is `undefined`', () => {
        it('returns "N/A"', () => {
          expect(
            CaseListUtils.tableRowContent({ ...referralView, organisationName: undefined }, 'Programme location'),
          ).toEqual('N/A')
        })
      })
    })

    describe('Programme name', () => {
      it('returns the course name', () => {
        expect(CaseListUtils.tableRowContent(referralView, 'Programme name')).toEqual('Test Course')
      })

      describe('when `courseName` is `undefined`', () => {
        it('returns "N/A"', () => {
          expect(CaseListUtils.tableRowContent({ ...referralView, courseName: undefined }, 'Programme name')).toEqual(
            'N/A',
          )
        })
      })
    })

    describe('Programme strand', () => {
      it('returns the audience', () => {
        expect(CaseListUtils.tableRowContent(referralView, 'Programme strand')).toEqual('General offence')
      })

      describe('when `audience` is `undefined`', () => {
        it('returns "N/A"', () => {
          expect(CaseListUtils.tableRowContent({ ...referralView, audience: undefined }, 'Programme strand')).toEqual(
            'N/A',
          )
        })
      })
    })

    describe('Progress', () => {
      it('returns the formatted tasks completed', () => {
        expect(CaseListUtils.tableRowContent(referralView, 'Progress')).toEqual('4 out of 4 tasks complete')
      })

      describe('when `tasksCompleted` is `undefined`', () => {
        it('sets the number to zero', () => {
          expect(CaseListUtils.tableRowContent({ ...referralView, tasksCompleted: undefined }, 'Progress')).toEqual(
            '0 out of 4 tasks complete',
          )
        })
      })
    })

    describe('Referral status', () => {
      it('returns the status as a status tag HTML string', () => {
        expect(CaseListUtils.tableRowContent(referralView, 'Referral status')).toEqual(
          CaseListUtils.statusTagHtml('green', 'Referral submitted'),
        )
      })
    })

    describe('Release date type', () => {
      it('returns the non-DTO release date type in a spelled out form', () => {
        expect(CaseListUtils.tableRowContent(referralView, 'Release date type')).toEqual('Automatic Release Date')
      })

      describe('when `nonDtoReleaseDateType` is `undefined`', () => {
        it('returns "N/A"', () => {
          expect(
            CaseListUtils.tableRowContent({ ...referralView, nonDtoReleaseDateType: undefined }, 'Release date type'),
          ).toEqual('N/A')
        })
      })
    })

    describe('Tariff end date', () => {
      it('returns a formatted tariff end date', () => {
        expect(CaseListUtils.tableRowContent(referralView, 'Tariff end date')).toEqual('1 January 2024')
      })

      describe('when `tariffExpiryDate` is `undefined`', () => {
        it('returns "N/A"', () => {
          expect(
            CaseListUtils.tableRowContent({ ...referralView, tariffExpiryDate: undefined }, 'Tariff end date'),
          ).toEqual('N/A')
        })
      })
    })
  })

  describe('tableRows', () => {
    const referralViews = [
      referralViewFactory.build({
        audience: 'General offence',
        conditionalReleaseDate: new Date('2023-01-01T00:00:00.000000').toISOString(),
        courseName: 'Test Course 1',
        earliestReleaseDate: new Date('2022-01-01T00:00:00.000000').toISOString(),
        forename: 'DEL',
        id: 'referral-123',
        nonDtoReleaseDateType: 'ARD',
        organisationName: 'Whatton (HMP)',
        paroleEligibilityDate: new Date('2022-01-01T00:00:00.000000').toISOString(),
        prisonNumber: 'ABC1234',
        status: 'referral_started',
        submittedOn: undefined,
        surname: 'HATTON',
        tariffExpiryDate: new Date('2024-01-01T00:00:00.000000').toISOString(),
        tasksCompleted: 2,
      }),
      referralViewFactory.build({
        audience: 'Extremism offence',
        conditionalReleaseDate: undefined,
        courseName: 'Test Course 2',
        earliestReleaseDate: undefined,
        forename: undefined,
        id: 'referral-456',
        nonDtoReleaseDateType: undefined,
        organisationName: undefined,
        paroleEligibilityDate: undefined,
        prisonNumber: 'DEF1234',
        status: 'referral_submitted',
        submittedOn: new Date('2021-01-01T00:00:00.000000').toISOString(),
        surname: undefined,
        tariffExpiryDate: undefined,
        tasksCompleted: undefined,
      }),
    ]

    it('formats referral summary information in the appropriate format for passing to a GOV.UK table Nunjucks macro, calling `tableRowContent` for text/HTML content', () => {
      const columnsToInclude: Array<CaseListColumnHeader> = [
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
      ]

      expect(CaseListUtils.tableRows(referralViews, columnsToInclude)).toEqual([
        [
          { text: CaseListUtils.tableRowContent(referralViews[0], 'Conditional release date') },
          { text: CaseListUtils.tableRowContent(referralViews[0], 'Date referred') },
          { text: CaseListUtils.tableRowContent(referralViews[0], 'Earliest release date') },
          { html: CaseListUtils.tableRowContent(referralViews[0], 'Name / Prison number') },
          { text: CaseListUtils.tableRowContent(referralViews[0], 'Parole eligibility date') },
          { text: CaseListUtils.tableRowContent(referralViews[0], 'Programme location') },
          { text: CaseListUtils.tableRowContent(referralViews[0], 'Programme name') },
          { text: CaseListUtils.tableRowContent(referralViews[0], 'Programme strand') },
          { text: CaseListUtils.tableRowContent(referralViews[0], 'Progress') },
          { html: CaseListUtils.tableRowContent(referralViews[0], 'Referral status') },
          { text: CaseListUtils.tableRowContent(referralViews[0], 'Release date type') },
          { text: CaseListUtils.tableRowContent(referralViews[0], 'Tariff end date') },
        ],
        [
          { text: CaseListUtils.tableRowContent(referralViews[1], 'Conditional release date') },
          { text: CaseListUtils.tableRowContent(referralViews[1], 'Date referred') },
          { text: CaseListUtils.tableRowContent(referralViews[1], 'Earliest release date') },
          { html: CaseListUtils.tableRowContent(referralViews[1], 'Name / Prison number') },
          { text: CaseListUtils.tableRowContent(referralViews[1], 'Parole eligibility date') },
          { text: CaseListUtils.tableRowContent(referralViews[1], 'Programme location') },
          { text: CaseListUtils.tableRowContent(referralViews[1], 'Programme name') },
          { text: CaseListUtils.tableRowContent(referralViews[1], 'Programme strand') },
          { text: CaseListUtils.tableRowContent(referralViews[1], 'Progress') },
          { html: CaseListUtils.tableRowContent(referralViews[1], 'Referral status') },
          { text: CaseListUtils.tableRowContent(referralViews[1], 'Release date type') },
          { text: CaseListUtils.tableRowContent(referralViews[1], 'Tariff end date') },
        ],
      ])
    })

    it('only includes data corresponding to the given column headers', () => {
      expect(
        CaseListUtils.tableRows(referralViews, ['Conditional release date', 'Date referred', 'Earliest release date']),
      ).toEqual([
        [
          { text: CaseListUtils.tableRowContent(referralViews[0], 'Conditional release date') },
          { text: CaseListUtils.tableRowContent(referralViews[0], 'Date referred') },
          { text: CaseListUtils.tableRowContent(referralViews[0], 'Earliest release date') },
        ],
        [
          { text: CaseListUtils.tableRowContent(referralViews[1], 'Conditional release date') },
          { text: CaseListUtils.tableRowContent(referralViews[1], 'Date referred') },
          { text: CaseListUtils.tableRowContent(referralViews[1], 'Earliest release date') },
        ],
      ])
    })

    describe('when referPaths is passed in as the paths argument', () => {
      it('passes the paths to `tableRowContent` for that row', () => {
        expect(CaseListUtils.tableRows(referralViews, ['Name / Prison number', 'Date referred'], referPaths)).toEqual([
          [
            { html: CaseListUtils.tableRowContent(referralViews[0], 'Name / Prison number', referPaths) },
            { text: CaseListUtils.tableRowContent(referralViews[0], 'Date referred') },
          ],
          [
            { html: CaseListUtils.tableRowContent(referralViews[1], 'Name / Prison number', referPaths) },
            { text: CaseListUtils.tableRowContent(referralViews[1], 'Date referred') },
          ],
        ])
      })
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
