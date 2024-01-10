import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { when } from 'jest-when'

import RisksAndNeedsController from './risksAndNeedsController'
import { referPaths } from '../../paths'
import type { CourseService, OasysService, PersonService, ReferralService } from '../../services'
import {
  courseFactory,
  courseOfferingFactory,
  offenceDetailFactory,
  organisationFactory,
  personFactory,
  referralFactory,
} from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import { CourseUtils, DateUtils, OffenceAnalysisUtils, ShowReferralUtils, ShowRisksAndNeedsUtils } from '../../utils'
import type { Person, Referral } from '@accredited-programmes/models'
import type { RisksAndNeedsSharedPageData } from '@accredited-programmes/ui'

jest.mock('../../utils/dateUtils')
jest.mock('../../utils/referrals/showReferralUtils')
jest.mock('../../utils/referrals/showRisksAndNeedsUtils')
jest.mock('../../utils/risksAndNeeds/offenceAnalysisUtils')

const mockDateUtils = DateUtils as jest.Mocked<typeof DateUtils>
const mockShowReferralUtils = ShowReferralUtils as jest.Mocked<typeof ShowReferralUtils>
const mockShowRisksAndNeedsUtils = ShowRisksAndNeedsUtils as jest.Mocked<typeof ShowRisksAndNeedsUtils>
const mockOffenceAnalysisUtils = OffenceAnalysisUtils as jest.Mocked<typeof OffenceAnalysisUtils>

describe('RisksAndNeedsController', () => {
  const userToken = 'SOME_TOKEN'
  const username = 'USERNAME'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const courseService = createMock<CourseService>({})
  const oasysService = createMock<OasysService>({})
  const personService = createMock<PersonService>({})
  const referralService = createMock<ReferralService>({})

  const course = courseFactory.build()
  const coursePresenter = CourseUtils.presentCourse(course)
  const organisation = organisationFactory.build()
  const courseOffering = courseOfferingFactory.build({ organisationId: organisation.id })
  const importedFromDate = '10 January 2024'
  const navigationItems = [{ active: true, href: 'nav-href', text: 'Nav Item' }]
  const subNavigationItems = [{ active: true, href: 'sub-nav-href', text: 'Sub Nav Item' }]
  let person: Person
  let referral: Referral
  let sharedPageData: Omit<RisksAndNeedsSharedPageData, 'navigationItems' | 'subNavigationItems'>

  let controller: RisksAndNeedsController

  beforeEach(() => {
    person = personFactory.build()
    referral = referralFactory.submitted().build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })
    mockDateUtils.govukFormattedFullDateString.mockReturnValue(importedFromDate)
    mockShowRisksAndNeedsUtils.navigationItems.mockReturnValue(navigationItems)
    mockShowReferralUtils.subNavigationItems.mockReturnValue(subNavigationItems)

    sharedPageData = {
      pageHeading: `Referral to ${coursePresenter.nameAndAlternateName}`,
      pageSubHeading: 'Risks and needs',
      person,
      referral,
    }

    courseService.getCourseByOffering.mockResolvedValue(course)
    courseService.getOffering.mockResolvedValue(courseOffering)
    personService.getPerson.mockResolvedValue(person)
    referralService.getReferral.mockResolvedValue(referral)

    controller = new RisksAndNeedsController(courseService, oasysService, personService, referralService)

    request = createMock<Request>({ params: { referralId: referral.id }, user: { token: userToken, username } })
    response = Helpers.createMockResponseWithCaseloads()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('offenceAnalysis', () => {
    it('renders the offence analysis page with the correct response locals', async () => {
      const offenceDetails = offenceDetailFactory.build()
      const impactAndConsequencesSummaryListRows = [{ key: { text: 'key-one' }, value: { text: 'value one' } }]
      const motivationAndTriggersText = 'Motivation and triggers text'
      const offenceDetailsText = 'Offence details text'
      const otherOffendersAndInfluencesSummaryListRows = [{ key: { text: 'key-two' }, value: { text: 'value two' } }]
      const patternOffendingText = 'Pattern offending text'
      const responsibilitySummaryListRows = [{ key: { text: 'key-three' }, value: { text: 'value three' } }]
      const victimsAndPartnersSummaryListRows = [{ key: { text: 'key-four' }, value: { text: 'value four' } }]

      mockOffenceAnalysisUtils.impactAndConsequencesSummaryListRows.mockReturnValue(
        impactAndConsequencesSummaryListRows,
      )
      mockOffenceAnalysisUtils.otherOffendersAndInfluencesSummaryListRows.mockReturnValue(
        otherOffendersAndInfluencesSummaryListRows,
      )
      mockOffenceAnalysisUtils.responsibilitySummaryListRows.mockReturnValue(responsibilitySummaryListRows)
      mockOffenceAnalysisUtils.victimsAndPartnersSummaryListRows.mockReturnValue(victimsAndPartnersSummaryListRows)

      when(oasysService.getOffenceDetails).calledWith(username, person.prisonNumber).mockResolvedValue(offenceDetails)
      when(OffenceAnalysisUtils.textValue)
        .calledWith(offenceDetails.motivationAndTriggers)
        .mockReturnValue(motivationAndTriggersText)
      when(OffenceAnalysisUtils.textValue)
        .calledWith(offenceDetails.patternOffending)
        .mockReturnValue(patternOffendingText)
      when(OffenceAnalysisUtils.textValue).calledWith(offenceDetails.offenceDetails).mockReturnValue(offenceDetailsText)

      request.path = referPaths.show.risksAndNeeds.offenceAnalysis({ referralId: referral.id })

      const requestHandler = controller.offenceAnalysis()
      await requestHandler(request, response, next)

      assertSharedDataServicesAreCalledWithExpectedArguments()

      expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/offenceAnalysis', {
        ...sharedPageData,
        impactAndConsequencesSummaryListRows,
        importedFromText: `Imported from OASys on ${importedFromDate}.`,
        motivationAndTriggersText,
        navigationItems,
        offenceDetailsText,
        otherOffendersAndInfluencesSummaryListRows,
        patternOffendingText,
        responsibilitySummaryListRows,
        subNavigationItems,
        victimsAndPartnersSummaryListRows,
      })
    })
  })

  function assertSharedDataServicesAreCalledWithExpectedArguments() {
    expect(referralService.getReferral).toHaveBeenCalledWith(username, referral.id)
    expect(courseService.getCourseByOffering).toHaveBeenCalledWith(username, referral.offeringId)
    expect(personService.getPerson).toHaveBeenCalledWith(username, person.prisonNumber, response.locals.user.caseloads)
  }
})
