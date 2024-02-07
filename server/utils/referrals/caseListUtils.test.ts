import CaseListUtils from './caseListUtils'
import { assessPaths, referPaths } from '../../paths'
import { courseFactory, referralSummaryFactory } from '../../testutils/factories'
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
          CaseListUtils.sortableTableHeadings('/case-list', caseListColumns, 'conditionalReleaseDate', 'ascending'),
        ).toEqual([
          {
            attributes: { 'aria-sort': 'none' },
            html: '<a class="govuk-link--no-visited-state" href="/case-list?sortColumn=surname&sortDirection=ascending">Name / Prison number</a>',
          },
          {
            attributes: { 'aria-sort': 'ascending' },
            html: '<a class="govuk-link--no-visited-state" href="/case-list?sortColumn=conditionalReleaseDate&sortDirection=descending">Conditional release date</a>',
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

  describe('tableRowContent', () => {
    const referralSummary = referralSummaryFactory.build({
      audience: 'General offence',
      courseName: 'Test Course',
      earliestReleaseDate: new Date('2022-01-01T00:00:00.000000').toISOString(),
      id: 'referral-123',
      prisonName: 'Whatton (HMP)',
      prisonNumber: 'ABC1234',
      prisonerName: { firstName: 'Del', lastName: 'Hatton' },
      sentence: {
        conditionalReleaseDate: new Date('2023-01-01T00:00:00.000000').toISOString(),
        nonDtoReleaseDateType: 'ARD',
        paroleEligibilityDate: new Date('2022-01-01T00:00:00.000000').toISOString(),
        tariffExpiryDate: new Date('2024-01-01T00:00:00.000000').toISOString(),
      },
      status: 'referral_submitted',
      submittedOn: new Date('2021-01-01T00:00:00.000000').toISOString(),
      tasksCompleted: 4,
    })

    describe('Conditional release date', () => {
      it('returns a formatted conditional release date', () => {
        expect(CaseListUtils.tableRowContent(referralSummary, 'Conditional release date')).toEqual('1 January 2023')
      })

      describe('when `sentence.conditionalReleaseDate` is `undefined`', () => {
        it('returns "N/A"', () => {
          expect(
            CaseListUtils.tableRowContent(
              { ...referralSummary, sentence: { ...referralSummary.sentence, conditionalReleaseDate: undefined } },
              'Conditional release date',
            ),
          ).toEqual('N/A')
        })
      })

      describe('when `sentence` is `undefined', () => {
        it('returns "N/A"', () => {
          expect(
            CaseListUtils.tableRowContent({ ...referralSummary, sentence: undefined }, 'Conditional release date'),
          ).toEqual('N/A')
        })
      })
    })

    describe('Date referred', () => {
      it('returns a formatted submitted on date', () => {
        expect(CaseListUtils.tableRowContent(referralSummary, 'Date referred')).toEqual('1 January 2021')
      })

      describe('when `submittedOn` is `undefined`', () => {
        it('returns "N/A"', () => {
          expect(
            CaseListUtils.tableRowContent({ ...referralSummary, submittedOn: undefined }, 'Date referred'),
          ).toEqual('N/A')
        })
      })
    })

    describe('Earliest release date', () => {
      it('returns a formatted earliest release date', () => {
        expect(CaseListUtils.tableRowContent(referralSummary, 'Earliest release date')).toEqual('1 January 2022')
      })

      describe('when `earliestReleaseDate` is `undefined`', () => {
        it('returns "N/A"', () => {
          expect(
            CaseListUtils.tableRowContent(
              { ...referralSummary, earliestReleaseDate: undefined },
              'Earliest release date',
            ),
          ).toEqual('N/A')
        })
      })
    })

    describe('Name / Prison number', () => {
      it('returns a HTML string with the prisoner name on the first line, which links to the referral, and their prison number on a new line', () => {
        expect(CaseListUtils.tableRowContent(referralSummary, 'Name / Prison number')).toEqual(
          '<a class="govuk-link" href="/assess/referrals/referral-123/personal-details">Del Hatton</a><br>ABC1234',
        )
      })

      describe('with an unsubmitted referral', () => {
        it('links to the Refer new referral show page', () => {
          expect(
            CaseListUtils.tableRowContent(
              { ...referralSummary, status: 'referral_started', submittedOn: undefined },
              'Name / Prison number',
              assessPaths,
            ),
          ).toEqual('<a class="govuk-link" href="/refer/referrals/new/referral-123">Del Hatton</a><br>ABC1234')
        })
      })

      describe('when referPaths is passed in as the paths argument', () => {
        it('links to a Refer show referral page', () => {
          expect(CaseListUtils.tableRowContent(referralSummary, 'Name / Prison number', referPaths)).toEqual(
            '<a class="govuk-link" href="/refer/referrals/referral-123/personal-details">Del Hatton</a><br>ABC1234',
          )
        })
      })

      describe('when `prisonerName` is `undefined`', () => {
        it('omits the prisoner name and adds the link to their prison number instead', () => {
          expect(
            CaseListUtils.tableRowContent({ ...referralSummary, prisonerName: undefined }, 'Name / Prison number'),
          ).toEqual('<a class="govuk-link" href="/assess/referrals/referral-123/personal-details">ABC1234</a>')
        })
      })
    })

    describe('Parole eligibility date', () => {
      it('returns a formatted parole eligibility date', () => {
        expect(CaseListUtils.tableRowContent(referralSummary, 'Parole eligibility date')).toEqual('1 January 2022')
      })

      describe('when `sentence.paroleEligibilityDate` is `undefined`', () => {
        it('returns "N/A"', () => {
          expect(
            CaseListUtils.tableRowContent(
              { ...referralSummary, sentence: { ...referralSummary.sentence, paroleEligibilityDate: undefined } },
              'Parole eligibility date',
            ),
          ).toEqual('N/A')
        })
      })

      describe('when `sentence` is `undefined', () => {
        it('returns "N/A"', () => {
          expect(
            CaseListUtils.tableRowContent({ ...referralSummary, sentence: undefined }, 'Parole eligibility date'),
          ).toEqual('N/A')
        })
      })
    })

    describe('Programme location', () => {
      it('returns the prison name', () => {
        expect(CaseListUtils.tableRowContent(referralSummary, 'Programme location')).toEqual('Whatton (HMP)')
      })

      describe('when `prisonName` is `undefined`', () => {
        it('returns "N/A"', () => {
          expect(
            CaseListUtils.tableRowContent({ ...referralSummary, prisonName: undefined }, 'Programme location'),
          ).toEqual('N/A')
        })
      })
    })

    describe('Programme name', () => {
      it('returns the course name', () => {
        expect(CaseListUtils.tableRowContent(referralSummary, 'Programme name')).toEqual('Test Course')
      })
    })

    describe('Programme strand', () => {
      it('returns the audience', () => {
        expect(CaseListUtils.tableRowContent(referralSummary, 'Programme strand')).toEqual('General offence')
      })
    })

    describe('Progress', () => {
      it('returns the formatted tasks completed', () => {
        expect(CaseListUtils.tableRowContent(referralSummary, 'Progress')).toEqual('4 out of 4 tasks complete')
      })

      describe('when `tasksCompleted` is `undefined`', () => {
        it('sets the number to zero', () => {
          expect(CaseListUtils.tableRowContent({ ...referralSummary, tasksCompleted: undefined }, 'Progress')).toEqual(
            '0 out of 4 tasks complete',
          )
        })
      })
    })

    describe('Referral status', () => {
      it('returns the status as a status tag HTML string', () => {
        expect(CaseListUtils.tableRowContent(referralSummary, 'Referral status')).toEqual(
          CaseListUtils.statusTagHtml('referral_submitted'),
        )
      })
    })

    describe('Release date type', () => {
      it('returns the non-DTO release date type in a spelled out form', () => {
        expect(CaseListUtils.tableRowContent(referralSummary, 'Release date type')).toEqual('Automatic Release Date')
      })

      describe('when `sentence.nonDtoReleaseDateType` is `undefined`', () => {
        it('returns "N/A"', () => {
          expect(
            CaseListUtils.tableRowContent(
              { ...referralSummary, sentence: { ...referralSummary.sentence, nonDtoReleaseDateType: undefined } },
              'Release date type',
            ),
          ).toEqual('N/A')
        })
      })

      describe('when `sentence` is `undefined', () => {
        it('returns "N/A"', () => {
          expect(
            CaseListUtils.tableRowContent({ ...referralSummary, sentence: undefined }, 'Release date type'),
          ).toEqual('N/A')
        })
      })
    })

    describe('Tariff end date', () => {
      it('returns a formatted tariff end date', () => {
        expect(CaseListUtils.tableRowContent(referralSummary, 'Tariff end date')).toEqual('1 January 2024')
      })

      describe('when `sentence.tariffExpiryDate` is `undefined`', () => {
        it('returns "N/A"', () => {
          expect(
            CaseListUtils.tableRowContent(
              { ...referralSummary, sentence: { ...referralSummary.sentence, tariffExpiryDate: undefined } },
              'Tariff end date',
            ),
          ).toEqual('N/A')
        })
      })

      describe('when `sentence` is `undefined', () => {
        it('returns "N/A"', () => {
          expect(CaseListUtils.tableRowContent({ ...referralSummary, sentence: undefined }, 'Tariff end date')).toEqual(
            'N/A',
          )
        })
      })
    })
  })

  describe('tableRows', () => {
    const referralSummaries = [
      referralSummaryFactory.build({
        audience: 'General offence',
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
        audience: 'Extremism offence',
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

      expect(CaseListUtils.tableRows(referralSummaries, columnsToInclude)).toEqual([
        [
          {
            attributes: { 'data-sort-value': '2023-01-01T00:00:00.000Z' },
            text: CaseListUtils.tableRowContent(referralSummaries[0], 'Conditional release date'),
          },
          {
            attributes: { 'data-sort-value': undefined },
            text: CaseListUtils.tableRowContent(referralSummaries[0], 'Date referred'),
          },
          {
            attributes: { 'data-sort-value': '2022-01-01T00:00:00.000Z' },
            text: CaseListUtils.tableRowContent(referralSummaries[0], 'Earliest release date'),
          },
          {
            attributes: { 'data-sort-value': 'Del Hatton' },
            html: CaseListUtils.tableRowContent(referralSummaries[0], 'Name / Prison number'),
          },
          {
            attributes: { 'data-sort-value': '2022-01-01T00:00:00.000Z' },
            text: CaseListUtils.tableRowContent(referralSummaries[0], 'Parole eligibility date'),
          },
          {
            attributes: { 'data-sort-value': 'Whatton (HMP)' },
            text: CaseListUtils.tableRowContent(referralSummaries[0], 'Programme location'),
          },
          { text: CaseListUtils.tableRowContent(referralSummaries[0], 'Programme name') },
          { text: CaseListUtils.tableRowContent(referralSummaries[0], 'Programme strand') },
          { text: CaseListUtils.tableRowContent(referralSummaries[0], 'Progress') },
          {
            attributes: { 'data-sort-value': 'referral_started' },
            html: CaseListUtils.tableRowContent(referralSummaries[0], 'Referral status'),
          },
          {
            attributes: { 'data-sort-value': 'ARD' },
            text: CaseListUtils.tableRowContent(referralSummaries[0], 'Release date type'),
          },
          {
            attributes: { 'data-sort-value': '2024-01-01T00:00:00.000Z' },
            text: CaseListUtils.tableRowContent(referralSummaries[0], 'Tariff end date'),
          },
        ],
        [
          {
            attributes: { 'data-sort-value': undefined },
            text: CaseListUtils.tableRowContent(referralSummaries[1], 'Conditional release date'),
          },
          {
            attributes: { 'data-sort-value': '2021-01-01T00:00:00.000Z' },
            text: CaseListUtils.tableRowContent(referralSummaries[1], 'Date referred'),
          },
          {
            attributes: { 'data-sort-value': undefined },
            text: CaseListUtils.tableRowContent(referralSummaries[1], 'Earliest release date'),
          },
          {
            attributes: { 'data-sort-value': '' },
            html: CaseListUtils.tableRowContent(referralSummaries[1], 'Name / Prison number'),
          },
          {
            attributes: { 'data-sort-value': undefined },
            text: CaseListUtils.tableRowContent(referralSummaries[1], 'Parole eligibility date'),
          },
          {
            attributes: { 'data-sort-value': undefined },
            text: CaseListUtils.tableRowContent(referralSummaries[1], 'Programme location'),
          },
          { text: CaseListUtils.tableRowContent(referralSummaries[1], 'Programme name') },
          { text: CaseListUtils.tableRowContent(referralSummaries[1], 'Programme strand') },
          { text: CaseListUtils.tableRowContent(referralSummaries[1], 'Progress') },
          {
            attributes: { 'data-sort-value': 'referral_submitted' },
            html: CaseListUtils.tableRowContent(referralSummaries[1], 'Referral status'),
          },
          {
            attributes: { 'data-sort-value': undefined },
            text: CaseListUtils.tableRowContent(referralSummaries[1], 'Release date type'),
          },
          {
            attributes: { 'data-sort-value': undefined },
            text: CaseListUtils.tableRowContent(referralSummaries[1], 'Tariff end date'),
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
            text: CaseListUtils.tableRowContent(referralSummaries[0], 'Conditional release date'),
          },
          {
            attributes: { 'data-sort-value': undefined },
            text: CaseListUtils.tableRowContent(referralSummaries[0], 'Date referred'),
          },
          {
            attributes: { 'data-sort-value': '2022-01-01T00:00:00.000Z' },
            text: CaseListUtils.tableRowContent(referralSummaries[0], 'Earliest release date'),
          },
        ],
        [
          {
            attributes: { 'data-sort-value': undefined },
            text: CaseListUtils.tableRowContent(referralSummaries[1], 'Conditional release date'),
          },
          {
            attributes: { 'data-sort-value': '2021-01-01T00:00:00.000Z' },
            text: CaseListUtils.tableRowContent(referralSummaries[1], 'Date referred'),
          },
          {
            attributes: { 'data-sort-value': undefined },
            text: CaseListUtils.tableRowContent(referralSummaries[1], 'Earliest release date'),
          },
        ],
      ])
    })

    describe('when referPaths is passed in as the paths argument', () => {
      it('passes the paths to `tableRowContent` for that row', () => {
        expect(
          CaseListUtils.tableRows(referralSummaries, ['Name / Prison number', 'Date referred'], referPaths),
        ).toEqual([
          [
            {
              attributes: { 'data-sort-value': 'Del Hatton' },
              html: CaseListUtils.tableRowContent(referralSummaries[0], 'Name / Prison number', referPaths),
            },
            {
              attributes: { 'data-sort-value': undefined },
              text: CaseListUtils.tableRowContent(referralSummaries[0], 'Date referred'),
            },
          ],
          [
            {
              attributes: { 'data-sort-value': '' },
              html: CaseListUtils.tableRowContent(referralSummaries[1], 'Name / Prison number', referPaths),
            },
            {
              attributes: { 'data-sort-value': '2021-01-01T00:00:00.000Z' },
              text: CaseListUtils.tableRowContent(referralSummaries[1], 'Date referred'),
            },
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
