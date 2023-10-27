import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { when } from 'jest-when'

import SubmittedReferralsController from './submittedReferralsController'
import { referPaths } from '../../paths'
import type { CourseService, OrganisationService, PersonService, ReferralService } from '../../services'
import {
  courseFactory,
  courseOfferingFactory,
  courseParticipationFactory,
  organisationFactory,
  personFactory,
  referralFactory,
  userFactory,
} from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import { CourseParticipationUtils, CourseUtils, DateUtils, PersonUtils, ReferralUtils, StringUtils } from '../../utils'
import type { CourseParticipationPresenter } from '@accredited-programmes/ui'

jest.mock('../../utils/courseParticipationUtils')

describe('SubmittedReferralsController', () => {
  const token = 'SOME_TOKEN'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const courseService = createMock<CourseService>({})
  const organisationService = createMock<OrganisationService>({})
  const personService = createMock<PersonService>({})
  const referralService = createMock<ReferralService>({})

  const course = courseFactory.build()
  const courseOffering = courseOfferingFactory.build()
  const organisation = organisationFactory.build()
  const person = personFactory.build()
  const referral = referralFactory.submitted().build({ prisonNumber: person.prisonNumber })

  let submittedReferralsController: SubmittedReferralsController

  beforeEach(() => {
    request = createMock<Request>({ user: { token } })
    response = Helpers.createMockResponseWithCaseloads()

    courseService.getCourseByOffering.mockResolvedValue(course)
    courseService.getOffering.mockResolvedValue(courseOffering)
    organisationService.getOrganisation.mockResolvedValue(organisation)
    personService.getPerson.mockResolvedValue(person)
    referralService.getReferral.mockResolvedValue(referral)

    submittedReferralsController = new SubmittedReferralsController(
      courseService,
      organisationService,
      personService,
      referralService,
    )
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('personalDetails', () => {
    it('renders the personal details template with the correct response locals', async () => {
      request.path = referPaths.submitted.personalDetails({ referralId: referral.id })

      const requestHandler = submittedReferralsController.personalDetails()
      await requestHandler(request, response, next)

      const coursePresenter = CourseUtils.presentCourse(course)

      expect(response.render).toHaveBeenCalledWith('referrals/submitted/personalDetails', {
        courseOfferingSummaryListRows: ReferralUtils.courseOfferingSummaryListRows(coursePresenter, organisation.name),
        importedFromText: `Imported from Nomis on ${DateUtils.govukFormattedFullDateString()}.`,
        navigationItems: ReferralUtils.viewReferralNavigationItems(request.path, referral.id),
        pageHeading: `Referral to ${coursePresenter.nameAndAlternateName}`,
        person,
        personSummaryListRows: PersonUtils.summaryListRows(person),
        referral,
      })
    })
  })

  describe('programmeHistory', () => {
    it('renders the programme history template with the correct response locals', async () => {
      request.path = referPaths.submitted.programmeHistory({ referralId: referral.id })

      const addedByUser = userFactory.build()

      const earliestCourseParticipation = courseParticipationFactory.build({
        addedBy: addedByUser.username,
        createdAt: '2022-01-01T12:00:00.000Z',
      })
      const earliestCourseParticipationPresenter: CourseParticipationPresenter = {
        ...earliestCourseParticipation,
        addedByDisplayName: StringUtils.convertToTitleCase(addedByUser.name),
      }
      const latestCourseParticipation = courseParticipationFactory.build({
        addedBy: addedByUser.username,
        createdAt: '2023-01-01T12:00:00.000Z',
      })
      courseService.getParticipationsByPerson.mockResolvedValue([
        latestCourseParticipation,
        earliestCourseParticipation,
      ])
      const latestCourseParticipationPresenter: CourseParticipationPresenter = {
        ...latestCourseParticipation,
        addedByDisplayName: StringUtils.convertToTitleCase(addedByUser.name),
      }

      when(courseService.presentCourseParticipation)
        .calledWith(token, earliestCourseParticipation)
        .mockResolvedValue(earliestCourseParticipationPresenter)
      when(courseService.presentCourseParticipation)
        .calledWith(token, latestCourseParticipation)
        .mockResolvedValue(latestCourseParticipationPresenter)

      const summaryListOptions = 'summary list options'
      ;(CourseParticipationUtils.summaryListOptions as jest.Mock).mockImplementation(
        (_courseParticipation, _referralId, _withActions = { change: true, remove: true }) => {
          return summaryListOptions
        },
      )

      const requestHandler = submittedReferralsController.programmeHistory()
      await requestHandler(request, response, next)

      const coursePresenter = CourseUtils.presentCourse(course)

      expect(response.render).toHaveBeenCalledWith('referrals/submitted/programmeHistory', {
        courseOfferingSummaryListRows: ReferralUtils.courseOfferingSummaryListRows(coursePresenter, organisation.name),
        navigationItems: ReferralUtils.viewReferralNavigationItems(request.path, referral.id),
        pageHeading: `Referral to ${coursePresenter.nameAndAlternateName}`,
        participationSummaryListsOptions: [summaryListOptions, summaryListOptions],
        person,
        referral,
      })
    })
  })
})
