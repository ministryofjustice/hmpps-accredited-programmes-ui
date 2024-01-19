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
  lifestyleFactory,
  offenceDetailFactory,
  organisationFactory,
  personFactory,
  psychiatricFactory,
  referralFactory,
  relationshipsFactory,
  roshAnalysisFactory,
} from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import {
  CourseUtils,
  DateUtils,
  EmotionalWellbeingUtils,
  LifestyleAndAssociatesUtils,
  OffenceAnalysisUtils,
  RelationshipsUtils,
  RoshAnalysisUtils,
  ShowReferralUtils,
  ShowRisksAndNeedsUtils,
} from '../../utils'
import type { Person, Referral } from '@accredited-programmes/models'
import type { RisksAndNeedsSharedPageData } from '@accredited-programmes/ui'

jest.mock('../../utils/dateUtils')
jest.mock('../../utils/referrals/showReferralUtils')
jest.mock('../../utils/referrals/showRisksAndNeedsUtils')
jest.mock('../../utils/risksAndNeeds/emotionalWellbeingUtils')
jest.mock('../../utils/risksAndNeeds/lifestyleAndAssociatesUtils')
jest.mock('../../utils/risksAndNeeds/offenceAnalysisUtils')
jest.mock('../../utils/risksAndNeeds/relationshipsUtils')
jest.mock('../../utils/risksAndNeeds/roshAnalysisUtils')

const mockDateUtils = DateUtils as jest.Mocked<typeof DateUtils>
const mockShowReferralUtils = ShowReferralUtils as jest.Mocked<typeof ShowReferralUtils>
const mockShowRisksAndNeedsUtils = ShowRisksAndNeedsUtils as jest.Mocked<typeof ShowRisksAndNeedsUtils>
const mockEmotionalWellbeingUtils = EmotionalWellbeingUtils as jest.Mocked<typeof EmotionalWellbeingUtils>
const mockLifestyleAndAssociatesUtils = LifestyleAndAssociatesUtils as jest.Mocked<typeof LifestyleAndAssociatesUtils>
const mockOffenceAnalysisUtils = OffenceAnalysisUtils as jest.Mocked<typeof OffenceAnalysisUtils>
const mockRelationshipsUtils = RelationshipsUtils as jest.Mocked<typeof RelationshipsUtils>
const mockRoshAnalysisUtils = RoshAnalysisUtils as jest.Mocked<typeof RoshAnalysisUtils>

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

  describe('emotionalWellbeing', () => {
    it('renders the emotional wellbeing page with the correct response locals', async () => {
      const psychiatric = psychiatricFactory.build({ description: '0 - No problems' })
      const psychiatricSummaryListRows = [{ key: { text: 'key-one' }, value: { text: 'value one' } }]

      mockEmotionalWellbeingUtils.psychiatricSummaryListRows.mockReturnValue(psychiatricSummaryListRows)

      when(oasysService.getPsychiatric).calledWith(username, person.prisonNumber).mockResolvedValue(psychiatric)

      request.path = referPaths.show.risksAndNeeds.emotionalWellbeing({ referralId: referral.id })

      const requestHandler = controller.emotionalWellbeing()
      await requestHandler(request, response, next)

      assertSharedDataServicesAreCalledWithExpectedArguments()

      expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/emotionalWellbeing', {
        ...sharedPageData,
        hasEmotionalWellbeingData: true,
        importedFromText: `Imported from OASys on ${importedFromDate}.`,
        navigationItems,
        psychiatricSummaryListRows,
        subNavigationItems,
      })
    })

    describe('when the oasys service returns `null`', () => {
      it('renders the emotional wellbeing page with the correct response locals', async () => {
        when(oasysService.getPsychiatric).calledWith(username, person.prisonNumber).mockResolvedValue(null)

        request.path = referPaths.show.risksAndNeeds.emotionalWellbeing({ referralId: referral.id })

        const requestHandler = controller.emotionalWellbeing()
        await requestHandler(request, response, next)

        assertSharedDataServicesAreCalledWithExpectedArguments()

        expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/emotionalWellbeing', {
          ...sharedPageData,
          hasEmotionalWellbeingData: false,
          navigationItems,
          subNavigationItems,
        })
      })
    })
  })

  describe('lifestyleAndAssociates', () => {
    it('renders the lifestyle and associates page with the correct response locals', async () => {
      const lifestyle = lifestyleFactory.build({ activitiesEncourageOffending: '0 - No problems' })
      const reoffendingSummaryListRows = [{ key: { text: 'key-one' }, value: { text: 'value one' } }]

      mockLifestyleAndAssociatesUtils.reoffendingSummaryListRows.mockReturnValue(reoffendingSummaryListRows)

      when(oasysService.getLifestyle).calledWith(username, person.prisonNumber).mockResolvedValue(lifestyle)

      request.path = referPaths.show.risksAndNeeds.lifestyleAndAssociates({ referralId: referral.id })

      const requestHandler = controller.lifestyleAndAssociates()
      await requestHandler(request, response, next)

      assertSharedDataServicesAreCalledWithExpectedArguments()

      expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/lifestyleAndAssociates', {
        ...sharedPageData,
        hasLifestyle: true,
        importedFromText: `Imported from OASys on ${importedFromDate}.`,
        navigationItems,
        reoffendingSummaryListRows,
        subNavigationItems,
      })
    })

    describe('when the oasys service returns `null`', () => {
      it('renders the lifestyle and associates page with the correct response locals', async () => {
        when(oasysService.getLifestyle).calledWith(username, person.prisonNumber).mockResolvedValue(null)
        when(oasysService.getOffenceDetails).calledWith(username, person.prisonNumber).mockResolvedValue(null)

        request.path = referPaths.show.risksAndNeeds.lifestyleAndAssociates({ referralId: referral.id })

        const requestHandler = controller.lifestyleAndAssociates()
        await requestHandler(request, response, next)

        assertSharedDataServicesAreCalledWithExpectedArguments()

        expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/lifestyleAndAssociates', {
          ...sharedPageData,
          hasLifestyle: false,
          navigationItems,
          subNavigationItems,
        })
      })
    })
  })

  describe('offenceAnalysis', () => {
    it('renders the offence analysis page with the correct response locals', async () => {
      const offenceDetails = offenceDetailFactory.withAllOptionalFields().build()
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
      when(ShowRisksAndNeedsUtils.textValue)
        .calledWith(offenceDetails.motivationAndTriggers)
        .mockReturnValue(motivationAndTriggersText)
      when(ShowRisksAndNeedsUtils.textValue)
        .calledWith(offenceDetails.patternOffending)
        .mockReturnValue(patternOffendingText)
      when(ShowRisksAndNeedsUtils.textValue)
        .calledWith(offenceDetails.offenceDetails)
        .mockReturnValue(offenceDetailsText)

      request.path = referPaths.show.risksAndNeeds.offenceAnalysis({ referralId: referral.id })

      const requestHandler = controller.offenceAnalysis()
      await requestHandler(request, response, next)

      assertSharedDataServicesAreCalledWithExpectedArguments()

      expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/offenceAnalysis', {
        ...sharedPageData,
        hasOffenceDetails: true,
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

    describe('when the oasys service returns `null`', () => {
      it('renders the offence analysis page with the correct response locals', async () => {
        when(oasysService.getOffenceDetails).calledWith(username, person.prisonNumber).mockResolvedValue(null)

        request.path = referPaths.show.risksAndNeeds.offenceAnalysis({ referralId: referral.id })

        const requestHandler = controller.offenceAnalysis()
        await requestHandler(request, response, next)

        assertSharedDataServicesAreCalledWithExpectedArguments()

        expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/offenceAnalysis', {
          ...sharedPageData,
          hasOffenceDetails: false,
          navigationItems,
          subNavigationItems,
        })
      })
    })
  })

  describe('relationships', () => {
    it('renders the relationships page with the correct response locals', async () => {
      const relationships = relationshipsFactory.build()
      const domesticViolenceSummaryListRows = [{ key: { text: 'key-one' }, value: { text: 'value one' } }]

      mockRelationshipsUtils.domesticViolenceSummaryListRows.mockReturnValue(domesticViolenceSummaryListRows)

      when(oasysService.getRelationships).calledWith(username, person.prisonNumber).mockResolvedValue(relationships)

      request.path = referPaths.show.risksAndNeeds.relationships({ referralId: referral.id })

      const requestHandler = controller.relationships()
      await requestHandler(request, response, next)

      assertSharedDataServicesAreCalledWithExpectedArguments()

      expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/relationships', {
        ...sharedPageData,
        domesticViolenceSummaryListRows,
        hasRelationships: true,
        importedFromText: `Imported from OASys on ${importedFromDate}.`,
        navigationItems,
        subNavigationItems,
      })
    })

    describe('when the oasys service returns `null`', () => {
      it('renders the relationships page with the correct response locals', async () => {
        when(oasysService.getRelationships).calledWith(username, person.prisonNumber).mockResolvedValue(null)

        request.path = referPaths.show.risksAndNeeds.relationships({ referralId: referral.id })

        const requestHandler = controller.relationships()
        await requestHandler(request, response, next)

        assertSharedDataServicesAreCalledWithExpectedArguments()

        expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/relationships', {
          ...sharedPageData,
          hasRelationships: false,
          navigationItems,
          subNavigationItems,
        })
      })
    })
  })

  describe('roshAnalysis', () => {
    it('renders the offence analysis page with the correct response locals', async () => {
      const roshAnalysis = roshAnalysisFactory.build()
      const previousBehaviourSummaryListRows = [{ key: { text: 'key-one' }, value: { text: 'value one' } }]

      mockRoshAnalysisUtils.previousBehaviourSummaryListRows.mockReturnValue(previousBehaviourSummaryListRows)

      when(oasysService.getRoshAnalysis).calledWith(username, person.prisonNumber).mockResolvedValue(roshAnalysis)

      request.path = referPaths.show.risksAndNeeds.roshAnalysis({ referralId: referral.id })

      const requestHandler = controller.roshAnalysis()
      await requestHandler(request, response, next)

      assertSharedDataServicesAreCalledWithExpectedArguments()

      expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/roshAnalysis', {
        ...sharedPageData,
        hasRoshAnalysis: true,
        importedFromText: `Imported from OASys on ${importedFromDate}.`,
        navigationItems,
        previousBehaviourSummaryListRows,
        subNavigationItems,
      })
    })

    describe('when the OASys service returns `null`', () => {
      it('renders the offence analysis page with the correct response locals', async () => {
        when(oasysService.getRoshAnalysis).calledWith(username, person.prisonNumber).mockResolvedValue(null)

        request.path = referPaths.show.risksAndNeeds.roshAnalysis({ referralId: referral.id })

        const requestHandler = controller.roshAnalysis()
        await requestHandler(request, response, next)

        assertSharedDataServicesAreCalledWithExpectedArguments()

        expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/roshAnalysis', {
          ...sharedPageData,
          hasRoshAnalysis: false,
          navigationItems,
          subNavigationItems,
        })
      })
    })
  })

  function assertSharedDataServicesAreCalledWithExpectedArguments() {
    expect(referralService.getReferral).toHaveBeenCalledWith(username, referral.id)
    expect(courseService.getCourseByOffering).toHaveBeenCalledWith(username, referral.offeringId)
    expect(personService.getPerson).toHaveBeenCalledWith(username, person.prisonNumber, response.locals.user.caseloads)
  }
})
