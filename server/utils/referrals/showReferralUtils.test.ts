import CaseListUtils from './caseListUtils'
import ShowReferralUtils from './showReferralUtils'
import { assessPaths, referPaths } from '../../paths'
import {
  courseFactory,
  organisationFactory,
  referralFactory,
  referralStatusHistoryFactory,
  referralStatusRefDataFactory,
  staffDetailFactory,
} from '../../testutils/factories'
import CourseUtils from '../courseUtils'
import type { ReferralStatusHistoryPresenter } from '@accredited-programmes/ui'

jest.mock('./caseListUtils')

const mockCaseListUtils = CaseListUtils as jest.Mocked<typeof CaseListUtils>

describe('ShowReferralUtils', () => {
  const submittedReferral = referralFactory.submitted().build()
  const onProgrammeReferral = referralFactory.build({ status: 'on_programme' })
  const course = courseFactory.build({
    alternateName: 'TC+',
    audience: 'General offence',
    name: 'Test Course',
  })
  const buildingChoicesCourse = courseFactory.build({
    alternateName: 'BC',
    audience: 'General offence',
    name: 'Building Choices: High Intensity',
  })
  const becomingNewMePlusCourse = courseFactory.build({
    alternateName: 'BNM',
    audience: 'General offence',
    name: 'Becoming New Me Plus',
  })

  describe('buttonMenu', () => {
    describe('when in the assess journey', () => {
      describe('and the course is not Building Choices, the referral is not closed or on programme', () => {
        it('should show the Update Status and Move to Building Choices buttons in the menu', () => {
          expect(
            ShowReferralUtils.buttonMenu(course, submittedReferral, {
              currentPath: assessPaths.show.statusHistory({ referralId: submittedReferral.id }),
            }),
          ).toEqual({
            button: {
              classes: 'govuk-button--secondary',
              text: 'Update referral',
            },
            items: [
              {
                attributes: {
                  'aria-disabled': false,
                },
                classes: 'govuk-button--secondary',
                href: assessPaths.updateStatus.decision.show({ referralId: submittedReferral.id }),
                text: 'Update status',
              },
              {
                classes: 'govuk-button--secondary',
                href: assessPaths.transfer.show({ referralId: submittedReferral.id }),
                text: 'Move to Building Choices',
              },
            ],
          })
        })

        describe('when the course is Building Choices', () => {
          it.skip('should show the Update status and Change LDC status buttons in the menu', () => {
            expect(
              ShowReferralUtils.buttonMenu(buildingChoicesCourse, submittedReferral, {
                currentPath: assessPaths.show.statusHistory({ referralId: submittedReferral.id }),
              }),
            ).toEqual({
              button: {
                classes: 'govuk-button--secondary',
                text: 'Update referral',
              },
              items: [
                {
                  attributes: {
                    'aria-disabled': false,
                  },
                  classes: 'govuk-button--secondary',
                  href: assessPaths.updateStatus.decision.show({ referralId: submittedReferral.id }),
                  text: 'Update status',
                },
                {
                  classes: 'govuk-button--secondary',
                  href: assessPaths.updateLdc.show({ referralId: submittedReferral.id }),
                  text: 'Change LDC status',
                },
              ],
            })
          })
        })

        describe('when the course is not Building Choices', () => {
          it('should show the Update status and Move to Building choices buttons in the menu', () => {
            expect(
              ShowReferralUtils.buttonMenu(becomingNewMePlusCourse, submittedReferral, {
                currentPath: assessPaths.show.statusHistory({ referralId: submittedReferral.id }),
              }),
            ).toEqual({
              button: {
                classes: 'govuk-button--secondary',
                text: 'Update referral',
              },
              items: [
                {
                  attributes: {
                    'aria-disabled': false,
                  },
                  classes: 'govuk-button--secondary',
                  href: assessPaths.updateStatus.decision.show({ referralId: submittedReferral.id }),
                  text: 'Update status',
                },
                {
                  classes: 'govuk-button--secondary',
                  href: assessPaths.transfer.show({ referralId: submittedReferral.id }),
                  text: 'Move to Building Choices',
                },
              ],
            })
          })
        })

        describe('when the referral is closed', () => {
          it('should show the Update status button in a disabled state', () => {
            const closedReferral = referralFactory.closed().build()

            expect(
              ShowReferralUtils.buttonMenu(course, closedReferral, {
                currentPath: assessPaths.show.statusHistory({ referralId: closedReferral.id }),
              }),
            ).toEqual({
              button: {
                classes: 'govuk-button--secondary',
                text: 'Update referral',
              },
              items: [
                {
                  attributes: {
                    'aria-disabled': true,
                  },
                  classes: 'govuk-button--secondary',
                  href: undefined,
                  text: 'Update status',
                },
              ],
            })
          })
        })

        describe('when the referral status is on_programme', () => {
          it('should show the Update status button', () => {
            expect(
              ShowReferralUtils.buttonMenu(course, onProgrammeReferral, {
                currentPath: assessPaths.show.statusHistory({ referralId: onProgrammeReferral.id }),
              }),
            ).toEqual({
              button: {
                classes: 'govuk-button--secondary',
                text: 'Update referral',
              },
              items: [
                {
                  attributes: {
                    'aria-disabled': false,
                  },
                  classes: 'govuk-button--secondary',
                  href: assessPaths.updateStatus.decision.show({ referralId: onProgrammeReferral.id }),
                  text: 'Update status',
                },
              ],
            })
          })
        })
      })
    })
  })

  describe('buttons', () => {
    describe('when on the assess journey', () => {
      it('contains the "Back to referrals" button with the correct hrefs', () => {
        expect(
          ShowReferralUtils.buttons(
            { currentPath: assessPaths.show.statusHistory({ referralId: submittedReferral.id }) },
            submittedReferral,
            undefined,
          ),
        ).toEqual([
          {
            href: '/assess/referrals/case-list',
            text: 'Back to referrals',
          },
        ])
      })

      describe('and there is a `recentCaseListPath` value', () => {
        it('contains the "Back to referrals" button with the correct href', () => {
          const recentCaseListPath = '/assess/referrals/case-list'

          expect(
            ShowReferralUtils.buttons(
              {
                currentPath: assessPaths.show.statusHistory({ referralId: submittedReferral.id }),
                recentCaseListPath,
              },
              submittedReferral,
              undefined,
            ),
          ).toEqual(
            expect.arrayContaining([
              {
                href: recentCaseListPath,
                text: 'Back to referrals',
              },
            ]),
          )
        })
      })
    })

    describe('when on the refer journey', () => {
      it('contains the correct buttons, with the "Withdraw referral" and "Hold" buttons in a disabled state', () => {
        expect(
          ShowReferralUtils.buttons(
            { currentPath: referPaths.show.statusHistory({ referralId: submittedReferral.id }) },
            submittedReferral,
            undefined,
          ),
        ).toEqual([
          {
            href: '/refer/referrals/case-list',
            text: 'Back to referrals',
          },
          {
            attributes: {
              'aria-disabled': true,
            },
            classes: 'govuk-button--secondary',
            text: 'Put on hold',
          },
          {
            attributes: {
              'aria-disabled': true,
            },
            classes: 'govuk-button--secondary',
            text: 'Withdraw referral',
          },
        ])
      })

      describe('and the referral is closed', () => {
        it('disables the "Withdraw referral" and "Hold" buttons', () => {
          const closedReferral = referralFactory.closed().build()

          expect(
            ShowReferralUtils.buttons(
              { currentPath: referPaths.show.statusHistory({ referralId: closedReferral.id }) },
              closedReferral,
              undefined,
            ),
          ).toEqual(
            expect.arrayContaining([
              {
                attributes: {
                  'aria-disabled': true,
                },
                classes: 'govuk-button--secondary',
                href: undefined,
                text: 'Put on hold',
              },
              {
                attributes: {
                  'aria-disabled': true,
                },
                classes: 'govuk-button--secondary',
                href: undefined,
                text: 'Withdraw referral',
              },
            ]),
          )
        })
      })

      describe('with `statusTransitions`', () => {
        describe('when `statusTransitions` includes a hold status', () => {
          const statusTransitions = [
            referralStatusRefDataFactory.build({ code: 'ON_HOLD_REFERRAL_SUBMITTED', hold: true }),
            referralStatusRefDataFactory.build({ code: 'NOT_SUITABLE', hold: false }),
          ]

          it('contains the "Put on hold" button with the correct href', () => {
            expect(
              ShowReferralUtils.buttons(
                { currentPath: referPaths.show.statusHistory({ referralId: submittedReferral.id }) },
                submittedReferral,
                statusTransitions,
              ),
            ).toEqual(
              expect.arrayContaining([
                {
                  attributes: {
                    'aria-disabled': false,
                  },
                  classes: 'govuk-button--secondary',
                  href: `/refer/referrals/${submittedReferral.id}/manage-hold?status=ON_HOLD_REFERRAL_SUBMITTED`,
                  text: 'Put on hold',
                },
              ]),
            )
          })
        })

        describe('when `statusTransitions` includes a release status', () => {
          const statusTransitions = [
            referralStatusRefDataFactory.build({ code: 'REFERRAL_SUBMITTED', release: true }),
            referralStatusRefDataFactory.build({ code: 'NOT_SUITABLE', release: false }),
          ]

          it('contains the "Remove hold" button with the correct href', () => {
            expect(
              ShowReferralUtils.buttons(
                { currentPath: referPaths.show.statusHistory({ referralId: submittedReferral.id }) },
                submittedReferral,
                statusTransitions,
              ),
            ).toEqual(
              expect.arrayContaining([
                {
                  attributes: {
                    'aria-disabled': false,
                  },
                  classes: 'govuk-button--secondary',
                  href: `/refer/referrals/${submittedReferral.id}/manage-hold?status=REFERRAL_SUBMITTED`,
                  text: 'Remove hold',
                },
              ]),
            )
          })
        })

        describe('when `statusTransitions` includes the withdrawn status', () => {
          const statusTransitions = [referralStatusRefDataFactory.build({ code: 'WITHDRAWN', hold: true })]

          it('contains the "Withdraw referral" button with the correct href', () => {
            expect(
              ShowReferralUtils.buttons(
                { currentPath: referPaths.show.statusHistory({ referralId: submittedReferral.id }) },
                submittedReferral,
                statusTransitions,
              ),
            ).toEqual(
              expect.arrayContaining([
                {
                  attributes: {
                    'aria-disabled': false,
                  },
                  classes: 'govuk-button--secondary',
                  href: `/refer/referrals/${submittedReferral.id}/withdraw`,
                  text: 'Withdraw referral',
                },
              ]),
            )
          })
        })
      })
    })
  })

  describe('courseOfferingSummaryListRows', () => {
    it('formats course offering information in the appropriate format for passing to a GOV.UK summary list Nunjucks macro', () => {
      const coursePresenter = CourseUtils.presentCourse(course)
      const organisation = organisationFactory.build({ name: 'HMP Hewell' })
      const contactEmail = 'bob.smith@test-email.co.uk'

      expect(
        ShowReferralUtils.courseOfferingSummaryListRows('Bob Smith', coursePresenter, contactEmail, organisation.name),
      ).toEqual([
        {
          key: { text: 'Applicant name' },
          value: { text: 'Bob Smith' },
        },
        {
          key: { text: 'Programme name' },
          value: { text: 'Test Course: general offence' },
        },
        {
          key: { text: 'Programme strand' },
          value: { text: 'General offence' },
        },
        {
          key: { text: 'Programme location' },
          value: { text: 'HMP Hewell' },
        },
        {
          key: { text: 'Programme team email address' },
          value: { html: `<a href="mailto:${contactEmail}">${contactEmail}</a>` },
        },
      ])
    })
  })

  describe('statusHistoryTimelineItems', () => {
    const statusTagHtml = '<strong>Status tag</strong>'
    const statusTagHtmlWithPreviousReferralLink =
      '<strong>Status tag</strong><hr class="govuk-section-break govuk-section-break--m govuk-section-break--visible">This referral was transferred from Becoming New Me Plus. See <a href="/dummy-link">previous referral details</a>'

    beforeEach(() => {
      mockCaseListUtils.statusTagHtml.mockReturnValue('<strong>Status tag</strong>')
    })

    it('returns referral status history in the appropriate format for passing to a MoJ Frontend timeline Nunjucks macro', () => {
      const startedReferralStatusHistory = referralStatusHistoryFactory
        .started()
        .build({ notes: undefined, reasonDescription: undefined, statusStartDate: '2017-03-21T10:25:30.000Z' })
      const submittedReferralStatusHistory = referralStatusHistoryFactory
        .submitted()
        .build({ notes: undefined, reasonDescription: undefined, statusStartDate: '2017-03-22T10:25:30.000Z' })
      const updatedReferralStatusHistory = referralStatusHistoryFactory
        .updated()
        .build({ notes: 'Updated notes', reasonDescription: 'A reason', statusStartDate: '2017-03-23T10:25:30.000Z' })

      const statusHistoryPresenter: Array<ReferralStatusHistoryPresenter> = [
        { ...updatedReferralStatusHistory, byLineText: 'You' },
        { ...submittedReferralStatusHistory, byLineText: 'Test User' },
        { ...startedReferralStatusHistory, byLineText: 'Test User' },
      ]

      expect(ShowReferralUtils.statusHistoryTimelineItems(statusHistoryPresenter)).toEqual([
        {
          byline: { text: 'You' },
          datetime: {
            timestamp: updatedReferralStatusHistory.statusStartDate,
            type: 'datetime',
          },
          html: expect.stringMatching(/^(?=.*A reason)(?=.*Updated notes).*$/im),
          label: { text: 'Status update' },
        },
        {
          byline: { text: 'Test User' },
          datetime: {
            timestamp: submittedReferralStatusHistory.statusStartDate,
            type: 'datetime',
          },
          html: statusTagHtml,
          label: { text: 'Referral submitted' },
        },
        {
          byline: { text: 'Test User' },
          datetime: {
            timestamp: startedReferralStatusHistory.statusStartDate,
            type: 'datetime',
          },
          html: statusTagHtml,
          label: { text: 'Status update' },
        },
      ])
    })
    it('returns referral status history in the appropriate format with the previous referral link when present', () => {
      const submittedReferralStatusHistory = referralStatusHistoryFactory
        .submitted()
        .build({ notes: undefined, reasonDescription: undefined, statusStartDate: '2017-03-22T10:25:30.000Z' })
      const updatedReferralStatusHistory = referralStatusHistoryFactory
        .updated()
        .build({ notes: 'Updated notes', reasonDescription: 'A reason', statusStartDate: '2017-03-23T10:25:30.000Z' })

      const statusHistoryPresenter: Array<ReferralStatusHistoryPresenter> = [
        { ...updatedReferralStatusHistory, byLineText: 'You' },
        { ...submittedReferralStatusHistory, byLineText: 'Test User' },
      ]

      expect(
        ShowReferralUtils.statusHistoryTimelineItems(statusHistoryPresenter, '/dummy-link', 'Becoming New Me Plus'),
      ).toStrictEqual([
        {
          byline: { text: 'You' },
          datetime: {
            timestamp: updatedReferralStatusHistory.statusStartDate,
            type: 'datetime',
          },
          html: expect.stringMatching(/^(?=.*A reason)(?=.*Updated notes).*$/im),
          label: { text: 'Status update' },
        },
        {
          byline: { text: 'Test User' },
          datetime: {
            timestamp: submittedReferralStatusHistory.statusStartDate,
            type: 'datetime',
          },
          html: statusTagHtmlWithPreviousReferralLink,
          label: { text: 'Referral submitted' },
        },
      ])
    })
  })

  describe('submissionSummaryListRows', () => {
    it('returns submission details relating to a referral in the appropriate format for passing to a GOV.UK summary list Nunjucks macro', () => {
      const referral = referralFactory.submitted().build({ submittedOn: '2023-10-31T00:00:00.000000' })
      const referrerEmail = 'test.user@test-email.co.uk'

      expect(ShowReferralUtils.submissionSummaryListRows(referral.submittedOn, 'Test User', referrerEmail)).toEqual([
        {
          key: { text: 'Date referred' },
          value: { text: '31 October 2023' },
        },
        {
          key: { text: 'Referrer name' },
          value: { text: 'Test User' },
        },
        {
          key: { text: 'Referrer email address' },
          value: { html: `<a href="mailto:${referrerEmail}">${referrerEmail}</a>` },
        },
        {
          key: {
            text: 'Prison Offender Manager',
          },
          value: {
            text: 'Not assigned',
          },
        },
        {
          key: {
            text: 'Prison Offender Manager email address',
          },
          value: {
            text: 'Not assigned',
          },
        },
      ])
    })

    describe('when the referral has no submission date', () => {
      it("returns submission details with 'Not known' for the 'Date referred' value", () => {
        const referral = referralFactory.submitted().build({ submittedOn: undefined })

        expect(ShowReferralUtils.submissionSummaryListRows(referral.submittedOn, 'Test User', 'test@test.com')).toEqual(
          expect.arrayContaining([
            {
              key: { text: 'Date referred' },
              value: { text: 'Not known' },
            },
          ]),
        )
      })
    })

    describe('when the referral has a prison offender manager assigned', () => {
      const referral = referralFactory.submitted().build({
        primaryPrisonOffenderManager: staffDetailFactory.build({
          firstName: 'Bob',
          lastName: 'Smith',
          primaryEmail: 'bob.smith@email.com',
        }),
      })

      it('returns the prison offender manager details', () => {
        expect(
          ShowReferralUtils.submissionSummaryListRows(
            referral.submittedOn,
            'Test User',
            'test@test.com',
            referral.primaryPrisonOffenderManager,
          ),
        ).toEqual(
          expect.arrayContaining([
            {
              key: { text: 'Prison Offender Manager' },
              value: { text: 'Bob Smith' },
            },
            {
              key: { text: 'Prison Offender Manager email address' },
              value: {
                html: '<a href="mailto:bob.smith@email.com">bob.smith@email.com</a>',
              },
            },
          ]),
        )
      })
    })
  })

  describe('subNavigationItems', () => {
    const mockReferralId = 'mock-referral-id'

    describe('when on the refer journey', () => {
      it('returns navigation items for the show referral pages, in the correct order, with the refer paths and sets the Status history link as active', () => {
        const currentRequestPath = referPaths.show.statusHistory({ referralId: mockReferralId })

        expect(ShowReferralUtils.subNavigationItems(currentRequestPath, 'statusHistory', mockReferralId)).toEqual([
          {
            active: true,
            href: '/refer/referrals/mock-referral-id/status-history',
            text: 'Status history',
          },
          {
            active: false,
            href: '/refer/referrals/mock-referral-id/personal-details',
            text: 'Referral details',
          },
          {
            active: false,
            href: '/refer/referrals/mock-referral-id/risks-and-needs/risks-and-alerts',
            text: 'Risks and needs',
          },
        ])
      })

      it('returns navigation items for the show referral pages, in the correct order, with the refer paths and sets the Referral details link as active', () => {
        const currentRequestPath = referPaths.show.personalDetails({ referralId: mockReferralId })

        expect(ShowReferralUtils.subNavigationItems(currentRequestPath, 'referral', mockReferralId)).toEqual([
          {
            active: false,
            href: '/refer/referrals/mock-referral-id/status-history',
            text: 'Status history',
          },
          {
            active: true,
            href: '/refer/referrals/mock-referral-id/personal-details',
            text: 'Referral details',
          },
          {
            active: false,
            href: '/refer/referrals/mock-referral-id/risks-and-needs/risks-and-alerts',
            text: 'Risks and needs',
          },
        ])
      })

      it('returns navigation items for the show referral pages, in the correct order, with the refer paths and sets the Risks and needs link as active', () => {
        const currentRequestPath = referPaths.show.risksAndNeeds.offenceAnalysis({ referralId: mockReferralId })

        expect(ShowReferralUtils.subNavigationItems(currentRequestPath, 'risksAndNeeds', mockReferralId)).toEqual([
          {
            active: false,
            href: '/refer/referrals/mock-referral-id/status-history',
            text: 'Status history',
          },
          {
            active: false,
            href: '/refer/referrals/mock-referral-id/personal-details',
            text: 'Referral details',
          },
          {
            active: true,
            href: '/refer/referrals/mock-referral-id/risks-and-needs/risks-and-alerts',
            text: 'Risks and needs',
          },
        ])
      })
    })

    describe('when on the assess journey', () => {
      it('returns navigation items for the show referral pages, in the correct order,   with the assess paths and sets the Referral details link as active', () => {
        const currentRequestPath = assessPaths.show.personalDetails({ referralId: mockReferralId })

        expect(ShowReferralUtils.subNavigationItems(currentRequestPath, 'referral', mockReferralId)).toEqual([
          {
            active: true,
            href: '/assess/referrals/mock-referral-id/personal-details',
            text: 'Referral details',
          },
          {
            active: false,
            href: '/assess/referrals/mock-referral-id/risks-and-needs/risks-and-alerts',
            text: 'Risks and needs',
          },
          {
            active: false,
            href: '/assess/referrals/mock-referral-id/pni',
            text: 'Programme needs identifier',
          },
          {
            active: false,
            href: '/assess/referrals/mock-referral-id/status-history',
            text: 'Status history',
          },
        ])
      })

      it('returns navigation items for the show referral pages, in the correct order, with the assess paths and sets the Risks and needs link as active', () => {
        const currentRequestPath = assessPaths.show.risksAndNeeds.offenceAnalysis({ referralId: mockReferralId })

        expect(ShowReferralUtils.subNavigationItems(currentRequestPath, 'risksAndNeeds', mockReferralId)).toEqual([
          {
            active: false,
            href: '/assess/referrals/mock-referral-id/personal-details',
            text: 'Referral details',
          },
          {
            active: true,
            href: '/assess/referrals/mock-referral-id/risks-and-needs/risks-and-alerts',
            text: 'Risks and needs',
          },
          {
            active: false,
            href: '/assess/referrals/mock-referral-id/pni',
            text: 'Programme needs identifier',
          },
          {
            active: false,
            href: '/assess/referrals/mock-referral-id/status-history',
            text: 'Status history',
          },
        ])
      })

      it('returns navigation items for the show referral pages, in the correct order, with the assess paths and sets the Status history link as active', () => {
        const currentRequestPath = assessPaths.show.statusHistory({ referralId: mockReferralId })

        expect(ShowReferralUtils.subNavigationItems(currentRequestPath, 'statusHistory', mockReferralId)).toEqual([
          {
            active: false,
            href: '/assess/referrals/mock-referral-id/personal-details',
            text: 'Referral details',
          },
          {
            active: false,
            href: '/assess/referrals/mock-referral-id/risks-and-needs/risks-and-alerts',
            text: 'Risks and needs',
          },
          {
            active: false,
            href: '/assess/referrals/mock-referral-id/pni',
            text: 'Programme needs identifier',
          },
          {
            active: true,
            href: '/assess/referrals/mock-referral-id/status-history',
            text: 'Status history',
          },
        ])
      })
    })
  })

  describe('viewReferralNavigationItems', () => {
    const mockReferralId = 'mock-referral-id'

    describe('when viewing the referral on the refer journey', () => {
      it('returns navigation items for the view referral pages with the refer paths and sets the requested page as active', () => {
        const currentRequestPath = referPaths.show.personalDetails({ referralId: mockReferralId })

        expect(ShowReferralUtils.viewReferralNavigationItems(currentRequestPath, mockReferralId)).toEqual([
          {
            active: true,
            href: `${referPaths.show.personalDetails({ referralId: mockReferralId })}#content`,
            text: 'Personal details',
          },
          {
            active: false,
            href: `${referPaths.show.programmeHistory({ referralId: mockReferralId })}#content`,
            text: 'Programme history',
          },
          {
            active: false,
            href: `${referPaths.show.offenceHistory({ referralId: mockReferralId })}#content`,
            text: 'Offence history',
          },
          {
            active: false,
            href: `${referPaths.show.sentenceInformation({ referralId: mockReferralId })}#content`,
            text: 'Sentence information',
          },
          {
            active: false,
            href: `${referPaths.show.releaseDates({ referralId: mockReferralId })}#content`,
            text: 'Release dates',
          },
          {
            active: false,
            href: `${referPaths.show.additionalInformation({ referralId: mockReferralId })}#content`,
            text: 'Additional information',
          },
        ])
      })
    })

    describe('when viewing the referral on the assess journey', () => {
      it('returns navigation items for the view referral pages with the assess paths and sets the requested page as active', () => {
        const currentRequestPath = assessPaths.show.personalDetails({ referralId: mockReferralId })

        expect(ShowReferralUtils.viewReferralNavigationItems(currentRequestPath, mockReferralId)).toEqual([
          {
            active: true,
            href: `${assessPaths.show.personalDetails({ referralId: mockReferralId })}#content`,
            text: 'Personal details',
          },
          {
            active: false,
            href: `${assessPaths.show.programmeHistory({ referralId: mockReferralId })}#content`,
            text: 'Programme history',
          },
          {
            active: false,
            href: `${assessPaths.show.offenceHistory({ referralId: mockReferralId })}#content`,
            text: 'Offence history',
          },
          {
            active: false,
            href: `${assessPaths.show.sentenceInformation({ referralId: mockReferralId })}#content`,
            text: 'Sentence information',
          },
          {
            active: false,
            href: `${assessPaths.show.releaseDates({ referralId: mockReferralId })}#content`,
            text: 'Release dates',
          },
          {
            active: false,
            href: `${assessPaths.show.additionalInformation({ referralId: mockReferralId })}#content`,
            text: 'Additional information',
          },
        ])
      })
    })
  })
})
