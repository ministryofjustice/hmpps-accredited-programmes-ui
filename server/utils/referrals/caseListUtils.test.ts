import CaseListUtils from './caseListUtils'
import { assessPaths, referPaths } from '../../paths'
import { courseFactory, referralStatusRefDataFactory, referralViewFactory } from '../../testutils/factories'
import FormUtils from '../formUtils'
import type { ReferralStatus } from '@accredited-programmes/models'
import type { CaseListColumnHeader, SortableCaseListColumnKey } from '@accredited-programmes/ui'
import type { Audience } from '@accredited-programmes-api'

describe('CaseListUtils', () => {
  beforeAll(() => {
    jest.spyOn(FormUtils, 'getSelectItems').mockImplementation(() => [])
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('assessSubNavigationItems', () => {
    const currentPath = '/assess/referrals/course/course-id/case-list/open'

    it('returns an array of sub navigation items for programme team referrals', () => {
      const expectedItems = [
        {
          active: true,
          href: '/assess/referrals/course/course-id/case-list/open',
          text: 'Open referrals (10)',
        },
        {
          active: false,
          href: '/assess/referrals/course/course-id/case-list/closed',
          text: 'Closed referrals (5)',
        },
      ]

      expect(CaseListUtils.assessSubNavigationItems(currentPath, 'course-id', { closed: 5, open: 10 })).toEqual(
        expectedItems,
      )
    })

    describe('with query params', () => {
      it('returns an array of sub navigation items for programme team referrals with query params', () => {
        const expectedItems = [
          {
            active: true,
            href: '/assess/referrals/course/course-id/case-list/open?status=referral_started',
            text: 'Open referrals (10)',
          },
          {
            active: false,
            href: '/assess/referrals/course/course-id/case-list/closed?status=referral_started',
            text: 'Closed referrals (5)',
          },
        ]

        expect(
          CaseListUtils.assessSubNavigationItems(currentPath, 'course-id', { closed: 5, open: 10 }, [
            { key: 'status', value: 'referral_started' },
          ]),
        ).toEqual(expectedItems)
      })
    })
  })

  describe('primaryNavigationItems', () => {
    it('returns primary navigation items, with no duplicate course names, sorted alphabetically by course name and sets the correct item as active', () => {
      const blueCourse = courseFactory.build({ name: 'Blue Course' })
      const limeCourse = courseFactory.build({ name: 'Lime Course' })
      const orangeCourse = courseFactory.build({ name: 'Orange Course' })
      const courses = [limeCourse, orangeCourse, blueCourse]

      expect(
        CaseListUtils.primaryNavigationItems(`/assess/referrals/course/${orangeCourse.id}/case-list/open`, courses),
      ).toEqual([
        {
          active: false,
          href: `/assess/referrals/course/${blueCourse.id}/case-list/open`,
          text: 'Blue Course',
        },
        {
          active: false,
          href: `/assess/referrals/course/${limeCourse.id}/case-list/open`,
          text: 'Lime Course',
        },
        {
          active: true,
          href: `/assess/referrals/course/${orangeCourse.id}/case-list/open`,
          text: 'Orange Course',
        },
      ])
    })
  })

  describe('queryParamsExcludingPage', () => {
    const audienceQueryParam = { key: 'audience', value: 'general violence offence' }
    const nameOrIdQueryParam = { key: 'nameOrId', value: 'hatton' }
    const statusQueryParam = { key: 'status', value: 'referral started' as ReferralStatus }
    const sortColumnQueryParam = { key: 'sortColumn', value: 'conditionalReleaseDate' }
    const sortDirectionQueryParam = { key: 'sortDirection', value: 'ascending' }
    const hasLdcQueryParams = { key: 'hasLdc', value: true }

    describe('when all possible params are provided', () => {
      it('returns an array with one `QueryParam` for each, converting audience to "strand"', async () => {
        expect(
          CaseListUtils.queryParamsExcludingPage(
            audienceQueryParam.value,
            statusQueryParam.value,
            sortColumnQueryParam.value,
            sortDirectionQueryParam.value,
            nameOrIdQueryParam.value,
            hasLdcQueryParams.value,
          ),
        ).toEqual([
          { key: 'strand', value: audienceQueryParam.value },
          { key: 'nameOrId', value: nameOrIdQueryParam.value },
          { key: 'status', value: statusQueryParam.value },
          { key: 'sortColumn', value: sortColumnQueryParam.value },
          { key: 'sortDirection', value: sortDirectionQueryParam.value },
          { key: 'hasLdc', value: 'true' },
        ])
      })
    })

    describe('when only nameOrId is provided', () => {
      it('returns an array with a nameOrId `QueryParam`', async () => {
        expect(
          CaseListUtils.queryParamsExcludingPage(undefined, undefined, undefined, undefined, nameOrIdQueryParam.value),
        ).toEqual([{ key: 'nameOrId', value: nameOrIdQueryParam.value }])
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
    const nameOrIdQueryParam = { key: 'nameOrId', value: 'hatton' }
    const statusQueryParam = { key: 'status', value: 'referral started' as ReferralStatus }
    const pageQueryParam = { key: 'page', value: '2' }

    describe('when all possible params are provided', () => {
      it('returns an array with one `QueryParam` for each, converting audience to "strand"', async () => {
        expect(
          CaseListUtils.queryParamsExcludingSort(
            audienceQueryParam.value,
            statusQueryParam.value,
            pageQueryParam.value,
            nameOrIdQueryParam.value,
          ),
        ).toEqual([
          { key: 'strand', value: audienceQueryParam.value },
          { key: 'nameOrId', value: nameOrIdQueryParam.value },
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

  describe('referSubNavigationItems', () => {
    it('returns an array of sub navigation items for my referrals', () => {
      const currentPath = '/refer/referrals/case-list/open'
      const expectedItems = [
        {
          active: true,
          href: '/refer/referrals/case-list/open',
          text: 'Open referrals (15)',
        },
        {
          active: false,
          href: '/refer/referrals/case-list/draft',
          text: 'Draft referrals (10)',
        },
        {
          active: false,
          href: '/refer/referrals/case-list/closed',
          text: 'Closed referrals (5)',
        },
      ]

      expect(CaseListUtils.referSubNavigationItems(currentPath, { closed: 5, draft: 10, open: 15 })).toEqual(
        expectedItems,
      )
    })

    describe('with query params', () => {
      it('returns an array of sub navigation items for my referrals with query params', () => {
        const currentPath = '/refer/referrals/case-list/open'
        const expectedItems = [
          {
            active: true,
            href: '/refer/referrals/case-list/open?nameOrId=Hatton',
            text: 'Open referrals (15)',
          },
          {
            active: false,
            href: '/refer/referrals/case-list/draft?nameOrId=Hatton',
            text: 'Draft referrals (10)',
          },
          {
            active: false,
            href: '/refer/referrals/case-list/closed?nameOrId=Hatton',
            text: 'Closed referrals (5)',
          },
        ]

        expect(
          CaseListUtils.referSubNavigationItems(currentPath, { closed: 5, draft: 10, open: 15 }, [
            { key: 'nameOrId', value: 'Hatton' },
          ]),
        ).toEqual(expectedItems)
      })
    })
  })

  describe('sortableTableHeadings', () => {
    /* eslint-disable sort-keys */
    const caseListColumns: Partial<Record<SortableCaseListColumnKey, CaseListColumnHeader>> = {
      surname: 'Name and prison number',
      earliestReleaseDate: 'Earliest release date',
      audience: 'Programme strand',
      status: 'Referral status',
    }
    /* eslint-enable sort-keys */

    it('returns a formatted array to be used by GOV.UK Nunjucks table macro for sortable headings, wtih the default sorting set to "Name and prison number" in `ascending` order', () => {
      expect(CaseListUtils.sortableTableHeadings('/case-list', caseListColumns)).toEqual([
        {
          attributes: { 'aria-sort': 'ascending' },
          html: '<a class="govuk-link--no-visited-state" href="/case-list?sortColumn=surname&sortDirection=descending">Name and prison number</a>',
        },
        {
          attributes: { 'aria-sort': 'none' },
          html: '<a class="govuk-link--no-visited-state" href="/case-list?sortColumn=earliestReleaseDate&sortDirection=ascending">Earliest release date</a>',
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
          CaseListUtils.sortableTableHeadings('/case-list', caseListColumns, 'earliestReleaseDate', 'descending'),
        ).toEqual([
          {
            attributes: { 'aria-sort': 'none' },
            html: '<a class="govuk-link--no-visited-state" href="/case-list?sortColumn=surname&sortDirection=ascending">Name and prison number</a>',
          },
          {
            attributes: { 'aria-sort': 'descending' },
            html: '<a class="govuk-link--no-visited-state" href="/case-list?sortColumn=earliestReleaseDate&sortDirection=ascending">Earliest release date</a>',
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
            'earliestReleaseDate',
            'ascending',
          ),
        ).toEqual([
          {
            attributes: { 'aria-sort': 'none' },
            html: '<a class="govuk-link--no-visited-state" href="/case-list?audience=general+offence&sortColumn=surname&sortDirection=ascending">Name and prison number</a>',
          },
          {
            attributes: { 'aria-sort': 'ascending' },
            html: '<a class="govuk-link--no-visited-state" href="/case-list?audience=general+offence&sortColumn=earliestReleaseDate&sortDirection=descending">Earliest release date</a>',
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
    const referralStatuses = [
      referralStatusRefDataFactory.build({ code: 'ASSESSMENT_STARTED' }),
      referralStatusRefDataFactory.build({ code: 'REFERRAL_SUBMITTED' }),
    ]
    const expectedItems = {
      ASSESSMENT_STARTED: 'Assessment started',
      REFERRAL_SUBMITTED: 'Referral submitted',
    }

    it('makes a call to the `FormUtils.getSelectItems` method with an `undefined` `selectedValue` parameter', () => {
      CaseListUtils.statusSelectItems(referralStatuses)

      expect(FormUtils.getSelectItems).toHaveBeenCalledWith(expectedItems, undefined, undefined)
    })

    describe('when a selected value is provided', () => {
      it('makes a call to the `FormUtils.getSelectItems` method with the correct `selectedValue` parameter', () => {
        const selectedValue = 'ASSESSMENT_STARTED'

        CaseListUtils.statusSelectItems(referralStatuses, selectedValue)

        expect(FormUtils.getSelectItems).toHaveBeenCalledWith(expectedItems, selectedValue, undefined)
      })
    })

    describe('when choosing to hide the placeholder', () => {
      it('makes a call to the `FormUtils.getSelectItems` method with the correct `hidePlaceholder` parameter', () => {
        CaseListUtils.statusSelectItems(referralStatuses, undefined, true)

        expect(FormUtils.getSelectItems).toHaveBeenCalledWith(expectedItems, undefined, true)
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

  describe('tableRowContent', () => {
    const referralView = referralViewFactory.build({
      audience: 'General offence',
      conditionalReleaseDate: new Date('2023-01-01T00:00:00.000000').toISOString(),
      courseName: 'Test Course',
      earliestReleaseDate: new Date('2022-01-01T00:00:00.000000').toISOString(),
      earliestReleaseDateType: 'Home detention curfew eligibility date',
      forename: 'Del',
      id: 'referral-123',
      location: 'Whatton (HMP)',
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
        expect(CaseListUtils.tableRowContent(referralView, 'Earliest release date')).toEqual(
          '1 January 2022<br>Home detention curfew eligibility date',
        )
      })

      describe('when `earliestReleaseDate` is `undefined`', () => {
        it('returns "N/A"', () => {
          expect(
            CaseListUtils.tableRowContent({ ...referralView, earliestReleaseDate: undefined }, 'Earliest release date'),
          ).toEqual('N/A')
        })
      })
    })

    describe('Location', () => {
      it('returns the location', () => {
        expect(CaseListUtils.tableRowContent(referralView, 'Location')).toEqual('Whatton (HMP)')
      })

      describe('when `location` is `undefined`', () => {
        it('returns "N/A"', () => {
          expect(CaseListUtils.tableRowContent({ ...referralView, location: undefined }, 'Location')).toEqual('N/A')
        })
      })
    })

    describe('Name and prison number', () => {
      it('returns a HTML string with the prisoner name on the first line, which links to the referral, and their prison number on a new line', () => {
        expect(CaseListUtils.tableRowContent(referralView, 'Name and prison number')).toEqual(
          '<a class="govuk-link" href="/assess/referrals/referral-123/personal-details?updatePerson=true">Hatton, Del</a><br>ABC1234',
        )
      })

      describe('with an unsubmitted referral', () => {
        it('links to the Refer new referral show page', () => {
          expect(
            CaseListUtils.tableRowContent(
              { ...referralView, status: 'referral_started', submittedOn: undefined },
              'Name and prison number',
              assessPaths,
            ),
          ).toEqual(
            '<a class="govuk-link" href="/refer/referrals/new/referral-123?updatePerson=true">Hatton, Del</a><br>ABC1234',
          )
        })
      })

      describe('when referPaths is passed in as the paths argument', () => {
        it('links to the Refer show status history referral page', () => {
          expect(CaseListUtils.tableRowContent(referralView, 'Name and prison number', referPaths)).toEqual(
            '<a class="govuk-link" href="/refer/referrals/referral-123/status-history?updatePerson=true">Hatton, Del</a><br>ABC1234',
          )
        })
      })

      describe('when `forename` and `surname` are `undefined`', () => {
        it('omits the prisoner name and adds the link to their prison number instead', () => {
          expect(
            CaseListUtils.tableRowContent(
              { ...referralView, forename: undefined, surname: undefined },
              'Name and prison number',
            ),
          ).toEqual(
            '<a class="govuk-link" href="/assess/referrals/referral-123/personal-details?updatePerson=true">ABC1234</a>',
          )
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
      it('returns the course name with audience', () => {
        expect(CaseListUtils.tableRowContent(referralView, 'Programme name')).toEqual('Test Course: General offence')
      })

      describe('when `listDisplayName` is `undefined`', () => {
        it('returns "N/A"', () => {
          expect(
            CaseListUtils.tableRowContent({ ...referralView, listDisplayName: undefined }, 'Programme name'),
          ).toEqual('N/A')
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

    describe('Sentence type', () => {
      it('returns the sentence type as is', () => {
        expect(
          CaseListUtils.tableRowContent({ ...referralView, sentenceType: 'Life sentence' }, 'Sentence type'),
        ).toEqual('Life sentence')
      })

      describe('when `sentenceType` is `undefined`', () => {
        it('returns "N/A"', () => {
          expect(CaseListUtils.tableRowContent({ ...referralView, sentenceType: undefined }, 'Sentence type')).toEqual(
            'N/A',
          )
        })
      })

      describe('when `sentenceType` contains "Recall"', () => {
        it('returns the sentence type with "Recall" text in an `moj-badge`', () => {
          expect(
            CaseListUtils.tableRowContent(
              { ...referralView, sentenceType: 'Indeterminate and Recall' },
              'Sentence type',
            ),
          ).toEqual('Indeterminate <span class="moj-badge">Recall</span>')
        })

        it('returns "Recall" text in an `moj-badge`', () => {
          expect(CaseListUtils.tableRowContent({ ...referralView, sentenceType: 'Recall' }, 'Sentence type')).toEqual(
            '<span class="moj-badge">Recall</span>',
          )
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
        sentenceType: 'Determinate and Recall',
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
        sentenceType: 'Life sentence',
        status: 'referral_submitted',
        submittedOn: new Date('2021-01-01T00:00:00.000000').toISOString(),
        surname: undefined,
        tariffExpiryDate: undefined,
        tasksCompleted: undefined,
      }),
    ]

    it('formats referral summary information in the appropriate format for passing to a GOV.UK table Nunjucks macro, calling `tableRowContent` for text/HTML content', () => {
      const columnsToInclude: Array<CaseListColumnHeader> = [
        'Date referred',
        'Earliest release date',
        'Location',
        'Name and prison number',
        'Programme location',
        'Programme name',
        'Programme strand',
        'Progress',
        'Referral status',
        'Sentence type',
      ]

      expect(CaseListUtils.tableRows(referralViews, columnsToInclude)).toEqual([
        [
          { text: CaseListUtils.tableRowContent(referralViews[0], 'Date referred') },
          { html: CaseListUtils.tableRowContent(referralViews[0], 'Earliest release date') },
          { text: CaseListUtils.tableRowContent(referralViews[0], 'Location') },
          { html: CaseListUtils.tableRowContent(referralViews[0], 'Name and prison number') },
          { text: CaseListUtils.tableRowContent(referralViews[0], 'Programme location') },
          { text: CaseListUtils.tableRowContent(referralViews[0], 'Programme name') },
          { text: CaseListUtils.tableRowContent(referralViews[0], 'Programme strand') },
          { text: CaseListUtils.tableRowContent(referralViews[0], 'Progress') },
          { html: CaseListUtils.tableRowContent(referralViews[0], 'Referral status') },
          { html: CaseListUtils.tableRowContent(referralViews[0], 'Sentence type') },
        ],
        [
          { text: CaseListUtils.tableRowContent(referralViews[1], 'Date referred') },
          { html: CaseListUtils.tableRowContent(referralViews[1], 'Earliest release date') },
          { text: CaseListUtils.tableRowContent(referralViews[1], 'Location') },
          { html: CaseListUtils.tableRowContent(referralViews[1], 'Name and prison number') },
          { text: CaseListUtils.tableRowContent(referralViews[1], 'Programme location') },
          { text: CaseListUtils.tableRowContent(referralViews[1], 'Programme name') },
          { text: CaseListUtils.tableRowContent(referralViews[1], 'Programme strand') },
          { text: CaseListUtils.tableRowContent(referralViews[1], 'Progress') },
          { html: CaseListUtils.tableRowContent(referralViews[1], 'Referral status') },
          { html: CaseListUtils.tableRowContent(referralViews[1], 'Sentence type') },
        ],
      ])
    })

    it('only includes data corresponding to the given column headers', () => {
      expect(CaseListUtils.tableRows(referralViews, ['Date referred', 'Earliest release date'])).toEqual([
        [
          { text: CaseListUtils.tableRowContent(referralViews[0], 'Date referred') },
          { html: CaseListUtils.tableRowContent(referralViews[0], 'Earliest release date') },
        ],
        [
          { text: CaseListUtils.tableRowContent(referralViews[1], 'Date referred') },
          { html: CaseListUtils.tableRowContent(referralViews[1], 'Earliest release date') },
        ],
      ])
    })

    describe('when referPaths is passed in as the paths argument', () => {
      it('passes the paths to `tableRowContent` for that row', () => {
        expect(CaseListUtils.tableRows(referralViews, ['Name and prison number', 'Date referred'], referPaths)).toEqual(
          [
            [
              { html: CaseListUtils.tableRowContent(referralViews[0], 'Name and prison number', referPaths) },
              { text: CaseListUtils.tableRowContent(referralViews[0], 'Date referred') },
            ],
            [
              { html: CaseListUtils.tableRowContent(referralViews[1], 'Name and prison number', referPaths) },
              { text: CaseListUtils.tableRowContent(referralViews[1], 'Date referred') },
            ],
          ],
        )
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
})

describe('CaseListUtils::audienceSelectItems', () => {
  beforeAll(() => {
    jest.clearAllMocks()
  })

  describe('When the course is not building choices', () => {
    const courseAudiences: Array<Audience> = [
      { id: '1', name: 'General offence' },
      { id: '2', name: 'Extremism offence' },
      { id: '3', name: 'Gang offence' },
      { id: '4', name: undefined },
      { id: '5', name: 'General violence offence' },
      { id: '6', name: 'Intimate partner violence offence' },
      { id: '7', name: 'Sexual offence' },
    ]

    describe('no selected value', () => {
      it('makes a call to the `FormUtils.getSelectItems` method with an `undefined` `selectedValue` parameter', () => {
        const items = CaseListUtils.audienceSelectItems(courseAudiences, false)

        expect(items).toStrictEqual([
          { selected: true, text: 'Select', value: '' },
          {
            selected: false,
            text: 'General offence',
            value: 'general offence',
          },
          {
            selected: false,
            text: 'Extremism offence',
            value: 'extremism offence',
          },
          { selected: false, text: 'Gang offence', value: 'gang offence' },
          {
            selected: false,
            text: 'General violence offence',
            value: 'general violence offence',
          },
          {
            selected: false,
            text: 'Intimate partner violence offence',
            value: 'intimate partner violence offence',
          },
          {
            selected: false,
            text: 'Sexual offence',
            value: 'sexual offence',
          },
        ])
      })
    })

    describe('with selected value', () => {
      it('makes a call to the `FormUtils.getSelectItems` method with the correct `selectedValue` parameter', () => {
        const selectItems = CaseListUtils.audienceSelectItems(courseAudiences, false, 'general offence')

        expect(selectItems).toContainEqual({
          selected: true,
          text: 'General offence',
          value: 'general offence',
        })
      })
    })
  })

  describe('When the course is building choices', () => {
    const buildingChoicesAudiences: Array<Audience> = [
      { id: '1', name: 'General offence' },
      { id: '2', name: 'Sexual offence' },
    ]

    describe('when no selected value is provided', () => {
      it('makes a call to the `FormUtils.getSelectItems` method with an `undefined` `selectedValue` parameter', () => {
        const items = CaseListUtils.audienceSelectItems(buildingChoicesAudiences, true)
        expect(items).toStrictEqual([
          { selected: true, text: 'Select', value: '' },
          {
            selected: false,
            text: 'General offence: LDC Only',
            value: 'general offence::ldc',
          },
          {
            selected: false,
            text: 'General offence',
            value: 'general offence',
          },
          {
            selected: false,
            text: 'Sexual offence: LDC Only',
            value: 'sexual offence::ldc',
          },
          {
            selected: false,
            text: 'Sexual offence',
            value: 'sexual offence',
          },
        ])
      })
    })

    describe('when a selected value is provided', () => {
      it('makes a call to the `FormUtils.getSelectItems` method with the correct `selectedValue` parameter', () => {
        const items = CaseListUtils.audienceSelectItems(buildingChoicesAudiences, true, 'general offence')
        expect(items).toHaveLength(5)
        expect(items).toContainEqual({
          selected: true,
          text: 'General offence',
          value: 'general offence',
        })
      })
    })
  })
})
