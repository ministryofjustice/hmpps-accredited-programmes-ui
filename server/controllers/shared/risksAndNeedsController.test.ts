import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { when } from 'jest-when'

import RisksAndNeedsController from './risksAndNeedsController'
import { assessPaths, referPathBase, referPaths } from '../../paths'
import type { CourseService, OasysService, PersonService, ReferralService } from '../../services'
import {
  attitudeFactory,
  behaviourFactory,
  courseFactory,
  courseOfferingFactory,
  drugAlcoholDetailFactory,
  healthFactory,
  learningNeedsFactory,
  lifestyleFactory,
  offenceDetailFactory,
  organisationFactory,
  personFactory,
  psychiatricFactory,
  referralFactory,
  referralStatusRefDataFactory,
  relationshipsFactory,
  risksAndAlertsFactory,
  roshAnalysisFactory,
} from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import {
  AlcoholMisuseUtils,
  AttitudesUtils,
  CourseUtils,
  DateUtils,
  DrugMisuseUtils,
  EmotionalWellbeingUtils,
  HealthUtils,
  LearningNeedsUtils,
  LifestyleAndAssociatesUtils,
  OffenceAnalysisUtils,
  RelationshipsUtils,
  RisksAndAlertsUtils,
  RoshAnalysisUtils,
  ShowReferralUtils,
  ShowRisksAndNeedsUtils,
  ThinkingAndBehavingUtils,
} from '../../utils'
import type { Person, ReferralStatusRefData } from '@accredited-programmes/models'
import type { OspBox, RiskBox, RisksAndNeedsSharedPageData } from '@accredited-programmes/ui'
import type { Referral } from '@accredited-programmes-api'
import type { GovukFrontendTable } from '@govuk-frontend'

jest.mock('../../utils/dateUtils')
jest.mock('../../utils/referrals/showReferralUtils')
jest.mock('../../utils/referrals/showRisksAndNeedsUtils')
jest.mock('../../utils/risksAndNeeds/alcoholMisuseUtils')
jest.mock('../../utils/risksAndNeeds/attitudesUtils')
jest.mock('../../utils/risksAndNeeds/drugMisuseUtils')
jest.mock('../../utils/risksAndNeeds/emotionalWellbeingUtils')
jest.mock('../../utils/risksAndNeeds/healthUtils')
jest.mock('../../utils/risksAndNeeds/learningNeedsUtils')
jest.mock('../../utils/risksAndNeeds/lifestyleAndAssociatesUtils')
jest.mock('../../utils/risksAndNeeds/offenceAnalysisUtils')
jest.mock('../../utils/risksAndNeeds/relationshipsUtils')
jest.mock('../../utils/risksAndNeeds/risksAndAlertsUtils')
jest.mock('../../utils/risksAndNeeds/roshAnalysisUtils')
jest.mock('../../utils/risksAndNeeds/thinkingAndBehavingUtils')

const mockDateUtils = DateUtils as jest.Mocked<typeof DateUtils>
const mockShowReferralUtils = ShowReferralUtils as jest.Mocked<typeof ShowReferralUtils>
const mockShowRisksAndNeedsUtils = ShowRisksAndNeedsUtils as jest.Mocked<typeof ShowRisksAndNeedsUtils>
const mockAlcoholMisuseUtils = AlcoholMisuseUtils as jest.Mocked<typeof AlcoholMisuseUtils>
const mockAttitudesUtils = AttitudesUtils as jest.Mocked<typeof AttitudesUtils>
const mockDrugMisuseUtils = DrugMisuseUtils as jest.Mocked<typeof DrugMisuseUtils>
const mockEmotionalWellbeingUtils = EmotionalWellbeingUtils as jest.Mocked<typeof EmotionalWellbeingUtils>
const mockHealthUtils = HealthUtils as jest.Mocked<typeof HealthUtils>
const mockLearningNeedsUtils = LearningNeedsUtils as jest.Mocked<typeof LearningNeedsUtils>
const mockLifestyleAndAssociatesUtils = LifestyleAndAssociatesUtils as jest.Mocked<typeof LifestyleAndAssociatesUtils>
const mockOffenceAnalysisUtils = OffenceAnalysisUtils as jest.Mocked<typeof OffenceAnalysisUtils>
const mockRelationshipsUtils = RelationshipsUtils as jest.Mocked<typeof RelationshipsUtils>
const mockRisksAndAlertsUtils = RisksAndAlertsUtils as jest.Mocked<typeof RisksAndAlertsUtils>
const mockRoshAnalysisUtils = RoshAnalysisUtils as jest.Mocked<typeof RoshAnalysisUtils>
const mockThinkingAndBehavingUtils = ThinkingAndBehavingUtils as jest.Mocked<typeof ThinkingAndBehavingUtils>

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
  const recentCompletedAssessmentDate = '2023-12-19'
  const recentCompletedAssessmentDateString = '19 December 2023'
  const navigationItems = [{ active: true, href: 'nav-href', text: 'Nav Item' }]
  const subNavigationItems = [{ active: true, href: 'sub-nav-href', text: 'Sub Nav Item' }]
  const buttons = [{ href: 'button-href', text: 'Button' }]
  const recentCaseListPath = '/case-list-path'
  let person: Person
  let referral: Referral
  let sharedPageData: RisksAndNeedsSharedPageData
  let statusTransitions: Array<ReferralStatusRefData>

  let controller: RisksAndNeedsController

  beforeEach(() => {
    person = personFactory.build()
    referral = referralFactory.submitted().build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })
    mockDateUtils.govukFormattedFullDateString.mockReturnValue(recentCompletedAssessmentDateString)
    mockShowRisksAndNeedsUtils.navigationItems.mockReturnValue(navigationItems)
    mockShowReferralUtils.subNavigationItems.mockReturnValue(subNavigationItems)
    mockShowReferralUtils.buttons.mockReturnValue(buttons)

    sharedPageData = {
      buttons,
      navigationItems,
      pageHeading: `Referral to ${coursePresenter.displayName}`,
      pageSubHeading: 'Risks and needs',
      person,
      recentCompletedAssessmentDate: recentCompletedAssessmentDateString,
      referral,
      subNavigationItems,
    }
    statusTransitions = referralStatusRefDataFactory.buildList(2)

    courseService.getCourseByOffering.mockResolvedValue(course)
    courseService.getOffering.mockResolvedValue(courseOffering)
    oasysService.getAssessmentDateInfo.mockResolvedValue({ hasOpenAssessment: false, recentCompletedAssessmentDate })
    personService.getPerson.mockResolvedValue(person)
    referralService.getReferral.mockResolvedValue(referral)
    referralService.getStatusTransitions.mockResolvedValue(statusTransitions)

    controller = new RisksAndNeedsController(courseService, oasysService, personService, referralService)

    request = createMock<Request>({
      params: { referralId: referral.id },
      session: { recentCaseListPath },
      user: { token: userToken, username },
    })
    response = Helpers.createMockResponseWithCaseloads()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('alcoholMisuse', () => {
    it('renders the alcohol misuse page with the correct response locals', async () => {
      const getDrugAndAlcoholDetails = drugAlcoholDetailFactory.build({})
      const alcoholMisuseSummaryListRows = [{ key: { text: 'key-one' }, value: { text: 'value one' } }]

      mockAlcoholMisuseUtils.summaryListRows.mockReturnValue(alcoholMisuseSummaryListRows)

      when(oasysService.getDrugAndAlcoholDetails)
        .calledWith(username, person.prisonNumber)
        .mockResolvedValue(getDrugAndAlcoholDetails)

      request.path = referPaths.show.risksAndNeeds.alcoholMisuse({ referralId: referral.id })

      const requestHandler = controller.alcoholMisuse()
      await requestHandler(request, response, next)

      assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

      expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/alcoholMisuse', {
        ...sharedPageData,
        alcoholMisuseSummaryListRows,
        hasData: true,
      })
    })

    describe('when the oasys service returns `null`', () => {
      it('renders the alcohol misuse page with the correct response locals', async () => {
        when(oasysService.getDrugAndAlcoholDetails).calledWith(username, person.prisonNumber).mockResolvedValue(null)
        when(oasysService.getAssessmentDateInfo).calledWith(username, person.prisonNumber).mockResolvedValue(null)

        request.path = referPaths.show.risksAndNeeds.alcoholMisuse({ referralId: referral.id })

        const requestHandler = controller.alcoholMisuse()
        await requestHandler(request, response, next)

        assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

        expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/alcoholMisuse', {
          ...sharedPageData,
          hasData: false,
          recentCompletedAssessmentDate: undefined,
        })
      })
    })
  })

  describe('attitudes', () => {
    it('renders the attitudes page with the correct response locals', async () => {
      const attitudes = attitudeFactory.build()
      const attitudesSummaryListRows = [{ key: { text: 'key-one' }, value: { text: 'value one' } }]

      mockAttitudesUtils.attitudesSummaryListRows.mockReturnValue(attitudesSummaryListRows)

      when(oasysService.getAttitude).calledWith(username, person.prisonNumber).mockResolvedValue(attitudes)

      request.path = referPaths.show.risksAndNeeds.attitudes({ referralId: referral.id })

      const requestHandler = controller.attitudes()
      await requestHandler(request, response, next)

      assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

      expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/attitudes', {
        ...sharedPageData,
        attitudesSummaryListRows,
        hasData: true,

        navigationItems,
        subNavigationItems,
      })
    })

    describe('when the oasys service returns `null`', () => {
      it('renders the attitudes page with the correct response locals', async () => {
        when(oasysService.getAttitude).calledWith(username, person.prisonNumber).mockResolvedValue(null)

        request.path = referPaths.show.risksAndNeeds.attitudes({ referralId: referral.id })

        const requestHandler = controller.attitudes()
        await requestHandler(request, response, next)

        assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

        expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/attitudes', {
          ...sharedPageData,
          hasData: false,
          navigationItems,
          subNavigationItems,
        })
      })
    })

    describe('when on the assess path', () => {
      it('renders the attitudes page with the correct response locals', async () => {
        request.path = assessPaths.show.risksAndNeeds.attitudes({ referralId: referral.id })

        const requestHandler = controller.attitudes()
        await requestHandler(request, response, next)

        assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

        expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/attitudes', {
          ...sharedPageData,
          hasData: false,
          navigationItems,
          subNavigationItems,
        })
      })
    })

    describe('when oasys service returns an error', () => {
      it('renders the attitudes page with the correct response locals and also adds `oasysNomisErrorMessage`', async () => {
        const error = new Error('An error')
        when(oasysService.getAttitude).calledWith(username, person.prisonNumber).mockRejectedValue(error)

        request.path = referPaths.show.risksAndNeeds.attitudes({ referralId: referral.id })

        const requestHandler = controller.attitudes()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/attitudes', {
          ...sharedPageData,
          hasData: false,
          navigationItems,
          subNavigationItems,
        })
        expect(response.locals.oasysNomisErrorMessage).toBe(
          'We cannot retrieve this information from OASys or NOMIS at the moment. Try again later.',
        )
      })
    })
  })

  describe('drugMisuse', () => {
    it('renders the drug misuse page with the correct response locals', async () => {
      const getDrugAndAlcoholDetails = drugAlcoholDetailFactory.build({})
      const drugMisuseSummaryListRows = [{ key: { text: 'key-one' }, value: { text: 'value one' } }]

      mockDrugMisuseUtils.summaryListRows.mockReturnValue(drugMisuseSummaryListRows)

      when(oasysService.getDrugAndAlcoholDetails)
        .calledWith(username, person.prisonNumber)
        .mockResolvedValue(getDrugAndAlcoholDetails)

      request.path = referPaths.show.risksAndNeeds.drugMisuse({ referralId: referral.id })

      const requestHandler = controller.drugMisuse()
      await requestHandler(request, response, next)

      assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

      expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/drugMisuse', {
        ...sharedPageData,
        drugMisuseSummaryListRows,
        hasData: true,
      })
    })

    describe('when the oasys service returns `null`', () => {
      it('renders the drug misuse page with the correct response locals', async () => {
        when(oasysService.getDrugAndAlcoholDetails).calledWith(username, person.prisonNumber).mockResolvedValue(null)

        request.path = referPaths.show.risksAndNeeds.drugMisuse({ referralId: referral.id })

        const requestHandler = controller.drugMisuse()
        await requestHandler(request, response, next)

        assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

        expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/drugMisuse', {
          ...sharedPageData,
          hasData: false,
        })
      })
    })
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

      assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

      expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/emotionalWellbeing', {
        ...sharedPageData,
        hasData: true,

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

        assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

        expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/emotionalWellbeing', {
          ...sharedPageData,
          hasData: false,
          navigationItems,
          subNavigationItems,
        })
      })
    })
  })

  describe('learningNeeds', () => {
    it('renders the learning needs page with the correct response locals', async () => {
      const learningNeeds = learningNeedsFactory.withAllOptionalFields().build()
      const informationSummaryListRows = [{ key: { text: 'key-one' }, value: { text: 'value one' } }]
      const scoreSummaryListRows = [{ key: { text: 'key-two' }, value: { text: 'value two' } }]

      mockLearningNeedsUtils.informationSummaryListRows.mockReturnValue(informationSummaryListRows)
      mockLearningNeedsUtils.scoreSummaryListRows.mockReturnValue(scoreSummaryListRows)

      when(oasysService.getLearningNeeds).calledWith(username, person.prisonNumber).mockResolvedValue(learningNeeds)

      request.path = referPaths.show.risksAndNeeds.learningNeeds({ referralId: referral.id })

      const requestHandler = controller.learningNeeds()
      await requestHandler(request, response, next)

      assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

      expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/learningNeeds', {
        ...sharedPageData,
        hasData: true,

        informationSummaryListRows,
        navigationItems,
        scoreSummaryListRows,
        subNavigationItems,
      })
    })

    describe('when the OASys service returns `null`', () => {
      it('renders the learning needs page with the correct response locals', async () => {
        when(oasysService.getLearningNeeds).calledWith(username, person.prisonNumber).mockResolvedValue(null)

        request.path = referPaths.show.risksAndNeeds.learningNeeds({ referralId: referral.id })

        const requestHandler = controller.learningNeeds()
        await requestHandler(request, response, next)

        assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

        expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/learningNeeds', {
          ...sharedPageData,
          hasData: false,
          navigationItems,
          subNavigationItems,
        })
      })
    })
  })

  describe('health', () => {
    it('renders the health page with the correct response locals', async () => {
      const health = healthFactory.build({ anyHealthConditions: true, description: 'Some health conditions' })
      const healthSummaryListRows = [{ key: { text: 'key-one' }, value: { text: 'value one' } }]

      mockHealthUtils.healthSummaryListRows.mockReturnValue(healthSummaryListRows)

      when(oasysService.getHealth).calledWith(username, person.prisonNumber).mockResolvedValue(health)

      request.path = referPaths.show.risksAndNeeds.health({ referralId: referral.id })

      const requestHandler = controller.health()
      await requestHandler(request, response, next)

      assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

      expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/health', {
        ...sharedPageData,
        hasData: true,
        healthSummaryListRows,

        navigationItems,
        subNavigationItems,
      })
    })

    describe('when the oasys service returns `null`', () => {
      it('renders the health page with the correct response locals', async () => {
        when(oasysService.getHealth).calledWith(username, person.prisonNumber).mockResolvedValue(null)

        request.path = referPaths.show.risksAndNeeds.health({ referralId: referral.id })

        const requestHandler = controller.health()
        await requestHandler(request, response, next)

        assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

        expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/health', {
          ...sharedPageData,
          hasData: false,
          navigationItems,
          subNavigationItems,
        })
      })
    })
  })

  describe('lifestyleAndAssociates', () => {
    it('renders the lifestyle and associates page with the correct response locals', async () => {
      const lifestyleIssues = 'Lifestyle issues comments.'
      const lifestyle = lifestyleFactory.build({ activitiesEncourageOffending: '0 - No problems', lifestyleIssues })
      const criminalAssociatesSummaryListRows = [{ key: { text: 'criminial-associates' }, value: { text: 'Value' } }]
      const reoffendingSummaryListRows = [{ key: { text: 'reoffending' }, value: { text: 'Value' } }]

      mockLifestyleAndAssociatesUtils.criminalAssociatesSummaryListRows.mockReturnValue(
        criminalAssociatesSummaryListRows,
      )
      mockLifestyleAndAssociatesUtils.reoffendingSummaryListRows.mockReturnValue(reoffendingSummaryListRows)

      when(ShowRisksAndNeedsUtils.htmlTextValue).calledWith(lifestyle.lifestyleIssues).mockReturnValue(lifestyleIssues)

      when(oasysService.getLifestyle).calledWith(username, person.prisonNumber).mockResolvedValue(lifestyle)

      request.path = referPaths.show.risksAndNeeds.lifestyleAndAssociates({ referralId: referral.id })

      const requestHandler = controller.lifestyleAndAssociates()
      await requestHandler(request, response, next)

      assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

      expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/lifestyleAndAssociates', {
        ...sharedPageData,
        criminalAssociatesSummaryListRows,
        hasData: true,
        lifestyleIssues,
        reoffendingSummaryListRows,
      })
    })

    describe('when the oasys service returns `null`', () => {
      it('renders the lifestyle and associates page with the correct response locals', async () => {
        when(oasysService.getLifestyle).calledWith(username, person.prisonNumber).mockResolvedValue(null)

        request.path = referPaths.show.risksAndNeeds.lifestyleAndAssociates({ referralId: referral.id })

        const requestHandler = controller.lifestyleAndAssociates()
        await requestHandler(request, response, next)

        assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

        expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/lifestyleAndAssociates', {
          ...sharedPageData,
          hasData: false,
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
      when(ShowRisksAndNeedsUtils.htmlTextValue)
        .calledWith(offenceDetails.motivationAndTriggers)
        .mockReturnValue(motivationAndTriggersText)
      when(ShowRisksAndNeedsUtils.htmlTextValue)
        .calledWith(offenceDetails.patternOffending)
        .mockReturnValue(patternOffendingText)
      when(ShowRisksAndNeedsUtils.htmlTextValue)
        .calledWith(offenceDetails.offenceDetails)
        .mockReturnValue(offenceDetailsText)

      request.path = referPaths.show.risksAndNeeds.offenceAnalysis({ referralId: referral.id })

      const requestHandler = controller.offenceAnalysis()
      await requestHandler(request, response, next)

      assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

      expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/offenceAnalysis', {
        ...sharedPageData,
        hasData: true,
        impactAndConsequencesSummaryListRows,

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

        assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

        expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/offenceAnalysis', {
          ...sharedPageData,
          hasData: false,
          navigationItems,
          subNavigationItems,
        })
      })
    })
  })

  describe('relationships', () => {
    it('renders the relationships page with the correct response locals', async () => {
      const relIssuesDetails = 'Relationship issues details.'
      const relationships = relationshipsFactory.build({ relIssuesDetails })
      const closeRelationshipsSummaryListRows = [{ key: { text: 'close-relationships' }, value: { text: 'Value' } }]
      const domesticViolenceSummaryListRows = [{ key: { text: 'domestic-violence' }, value: { text: 'Value' } }]
      const familyRelationshipsSummaryListRows = [{ key: { text: 'family-relationships' }, value: { text: 'Value' } }]
      const relationshipToChildrenSummaryListRows = [
        { key: { text: 'children-relationship' }, value: { text: 'Value' } },
      ]

      mockRelationshipsUtils.closeRelationshipsSummaryListRows.mockReturnValue(closeRelationshipsSummaryListRows)
      mockRelationshipsUtils.domesticViolenceSummaryListRows.mockReturnValue(domesticViolenceSummaryListRows)
      mockRelationshipsUtils.familyRelationshipsSummaryListRows.mockReturnValue(familyRelationshipsSummaryListRows)
      mockRelationshipsUtils.relationshipToChildrenSummaryListRows.mockReturnValue(
        relationshipToChildrenSummaryListRows,
      )

      when(oasysService.getRelationships).calledWith(username, person.prisonNumber).mockResolvedValue(relationships)

      when(ShowRisksAndNeedsUtils.htmlTextValue)
        .calledWith(relationships.relIssuesDetails)
        .mockReturnValue(relIssuesDetails)

      request.path = referPaths.show.risksAndNeeds.relationships({ referralId: referral.id })

      const requestHandler = controller.relationships()
      await requestHandler(request, response, next)

      assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

      expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/relationships', {
        ...sharedPageData,
        closeRelationshipsSummaryListRows,
        domesticViolenceSummaryListRows,
        familyRelationshipsSummaryListRows,
        hasData: true,
        navigationItems,
        relIssuesDetails,
        relationshipToChildrenSummaryListRows,
      })
    })

    describe('when the oasys service returns `null`', () => {
      it('renders the relationships page with the correct response locals', async () => {
        when(oasysService.getRelationships).calledWith(username, person.prisonNumber).mockResolvedValue(null)

        request.path = referPaths.show.risksAndNeeds.relationships({ referralId: referral.id })

        const requestHandler = controller.relationships()
        await requestHandler(request, response, next)

        assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

        expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/relationships', {
          ...sharedPageData,
          hasData: false,
        })
      })
    })
  })

  describe('risksAndAlerts', () => {
    it('renders the risks and alerts page with the correct response locals', async () => {
      const risksAndAlerts = risksAndAlertsFactory.withAllOptionalFields().build({
        imminentRiskOfViolenceTowardsOthers: 'LOW',
        imminentRiskOfViolenceTowardsPartner: 'HIGH',
        ogrsYear1: 65.6,
        ogrsYear2: 89.1,
        ovpYear1: 70.2,
        ovpYear2: 78.5,
        rsrScore: 32.3,
      })
      const alertsGroupTables: Array<GovukFrontendTable> = [
        { classes: 'alerts-group-table', head: [{ text: 'heading' }], rows: [[{ text: 'value' }]] },
      ]
      const ogrsYear1Box: RiskBox = {
        category: 'OGRS Year 1',
        dataTestId: 'ogrs-year-1-risk-box',
        figure: `${risksAndAlerts.ogrsYear1?.toString()}%`,
        levelClass: 'risk-box--low',
        levelText: 'LOW',
      }
      const ogrsYear2Box: RiskBox = {
        category: 'OGRS Year 2',
        dataTestId: 'ogrs-year-2-risk-box',
        figure: `${risksAndAlerts.ogrsYear2?.toString()}%`,
        levelClass: 'risk-box--low',
        levelText: 'LOW',
      }
      const ospcBox: OspBox = { dataTestId: 'osp-c-box', levelClass: 'osp-box--low', levelText: 'LOW', type: 'OSP/C' }
      const ospiBox: OspBox = { dataTestId: 'ocp-i-box', levelClass: 'osp-box--low', levelText: 'LOW', type: 'OSP/I' }
      const ovpYear1Box: RiskBox = {
        category: 'OVP Year 1',
        dataTestId: 'ovp-year-1-risk-box',
        figure: `${risksAndAlerts.ovpYear1?.toString()}%`,
        levelClass: 'risk-box--low',
        levelText: 'LOW',
      }
      const ovpYear2Box: RiskBox = {
        category: 'OVP Year 2',
        dataTestId: 'ovp-year-2-risk-box',
        figure: `${risksAndAlerts.ovpYear2?.toString()}%`,
        levelClass: 'risk-box--low',
        levelText: 'LOW',
      }
      const roshBox: RiskBox = {
        category: 'RoSH',
        dataTestId: 'rosh-risk-box',
        levelClass: 'risk-box--low',
        levelText: 'LOW',
      }
      const roshTable = { classes: 'rosh-table', head: [{ text: 'heading' }], rows: [[{ text: 'value' }]] }
      const rsrBox: RiskBox = {
        category: 'RSR',
        dataTestId: 'rsr-risk-box',
        figure: `${risksAndAlerts.rsrScore?.toString()}`,
        levelClass: 'risk-box--low',
        levelText: 'LOW',
      }
      const saraOthersBox: RiskBox = {
        category: 'SARA',
        dataTestId: 'sara-others-risk-box',
        levelClass: 'risk-box--low',
        levelText: 'LOW',
      }
      const saraPartnerBox: RiskBox = {
        category: 'SARA',
        dataTestId: 'sara-partner-risk-box',
        levelClass: 'risk-box--high',
        levelText: 'HIGH',
      }

      when(oasysService.getRisksAndAlerts).calledWith(username, person.prisonNumber).mockResolvedValue(risksAndAlerts)
      when(mockRisksAndAlertsUtils.alertsGroupTables)
        .calledWith(risksAndAlerts.alerts)
        .mockReturnValue(alertsGroupTables)
      when(mockRisksAndAlertsUtils.riskBox)
        .calledWith('OGRS Year 1', risksAndAlerts.ogrsRisk, `${risksAndAlerts.ogrsYear1?.toString()}%`)
        .mockReturnValue(ogrsYear1Box)
      when(mockRisksAndAlertsUtils.riskBox)
        .calledWith('OGRS Year 2', risksAndAlerts.ogrsRisk, `${risksAndAlerts.ogrsYear2?.toString()}%`)
        .mockReturnValue(ogrsYear2Box)
      when(mockRisksAndAlertsUtils.ospBox).calledWith('OSP/C', risksAndAlerts.ospcScore).mockReturnValue(ospcBox)
      when(mockRisksAndAlertsUtils.ospBox).calledWith('OSP/I', risksAndAlerts.ospiScore).mockReturnValue(ospiBox)
      when(mockRisksAndAlertsUtils.riskBox)
        .calledWith('OVP Year 1', risksAndAlerts.ovpRisk, `${risksAndAlerts.ovpYear1?.toString()}%`)
        .mockReturnValue(ovpYear1Box)
      when(mockRisksAndAlertsUtils.riskBox)
        .calledWith('OVP Year 2', risksAndAlerts.ovpRisk, `${risksAndAlerts.ovpYear2?.toString()}%`)
        .mockReturnValue(ovpYear2Box)
      when(mockRisksAndAlertsUtils.riskBox).calledWith('RoSH', risksAndAlerts.overallRoshLevel).mockReturnValue(roshBox)
      mockRisksAndAlertsUtils.roshTable.mockReturnValue(roshTable)
      when(mockRisksAndAlertsUtils.riskBox)
        .calledWith('RSR', risksAndAlerts.rsrRisk, risksAndAlerts.rsrScore?.toString())
        .mockReturnValue(rsrBox)
      when(mockRisksAndAlertsUtils.riskBox)
        .calledWith('SARA', risksAndAlerts.imminentRiskOfViolenceTowardsOthers, undefined, 'sara-others')
        .mockReturnValue(saraOthersBox)
      when(mockRisksAndAlertsUtils.riskBox)
        .calledWith('SARA', risksAndAlerts.imminentRiskOfViolenceTowardsPartner, undefined, 'sara-partner')
        .mockReturnValue(saraPartnerBox)

      request.path = referPaths.show.risksAndNeeds.risksAndAlerts({ referralId: referral.id })

      const requestHandler = controller.risksAndAlerts()
      await requestHandler(request, response, next)

      assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

      expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/risksAndAlerts', {
        ...sharedPageData,
        alertsGroupTables,
        hasData: true,
        importedFromNomisText: `Imported from NOMIS on ${recentCompletedAssessmentDateString}.`,
        navigationItems,
        ogrsYear1Box,
        ogrsYear2Box,
        ospcBox,
        ospiBox,
        ovpYear1Box,
        ovpYear2Box,
        roshBox,
        roshTable,
        rsrBox,
        saraOthersBox,
        saraPartnerBox,
        subNavigationItems,
      })
    })

    describe('when the OASys service returns `null`', () => {
      it('renders the risks and alerts page with the correct response locals', async () => {
        when(oasysService.getRisksAndAlerts).calledWith(username, person.prisonNumber).mockResolvedValue(null)

        request.path = referPaths.show.risksAndNeeds.risksAndAlerts({ referralId: referral.id })

        const requestHandler = controller.risksAndAlerts()
        await requestHandler(request, response, next)

        assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

        expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/risksAndAlerts', {
          ...sharedPageData,
          hasData: false,
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

      assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

      expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/roshAnalysis', {
        ...sharedPageData,
        hasData: true,

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

        assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

        expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/roshAnalysis', {
          ...sharedPageData,
          hasData: false,
          navigationItems,
          subNavigationItems,
        })
      })
    })
  })

  describe('thinkingAndBehaving', () => {
    it('renders the thinking and behaving page with the correct response locals', async () => {
      const behaviour = behaviourFactory.build()
      const thinkingAndBehavingSummaryListRows = [{ key: { text: 'key-one' }, value: { text: 'value one' } }]

      mockThinkingAndBehavingUtils.thinkingAndBehavingSummaryListRows.mockReturnValue(
        thinkingAndBehavingSummaryListRows,
      )

      when(oasysService.getBehaviour).calledWith(username, person.prisonNumber).mockResolvedValue(behaviour)

      request.path = referPaths.show.risksAndNeeds.thinkingAndBehaving({ referralId: referral.id })

      const requestHandler = controller.thinkingAndBehaving()
      await requestHandler(request, response, next)

      assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

      expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/thinkingAndBehaving', {
        ...sharedPageData,
        hasData: true,

        navigationItems,
        subNavigationItems,
        thinkingAndBehavingSummaryListRows,
      })
    })

    describe('when the OASys service returns `null`', () => {
      it('renders the thinking and behaving page with the correct response locals', async () => {
        when(oasysService.getBehaviour).calledWith(username, person.prisonNumber).mockResolvedValue(null)

        request.path = referPaths.show.risksAndNeeds.thinkingAndBehaving({ referralId: referral.id })

        const requestHandler = controller.thinkingAndBehaving()
        await requestHandler(request, response, next)

        assertSharedDataServicesAreCalledWithExpectedArguments(request.path)

        expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/thinkingAndBehaving', {
          ...sharedPageData,
          hasData: false,
          navigationItems,
          subNavigationItems,
        })
      })
    })
  })

  function assertSharedDataServicesAreCalledWithExpectedArguments(path?: Request['path']) {
    const isRefer = path?.startsWith(referPathBase.pattern)

    expect(oasysService.getAssessmentDateInfo).toHaveBeenCalledWith(username, person.prisonNumber)
    expect(referralService.getReferral).toHaveBeenCalledWith(username, referral.id)
    expect(courseService.getCourseByOffering).toHaveBeenCalledWith(username, referral.offeringId)
    expect(personService.getPerson).toHaveBeenCalledWith(username, person.prisonNumber)
    expect(mockShowReferralUtils.buttons).toHaveBeenCalledWith(
      { currentPath: path, recentCaseListPath },
      referral,
      isRefer ? statusTransitions : undefined,
    )
    expect(mockShowReferralUtils.subNavigationItems).toHaveBeenCalledWith(path, 'risksAndNeeds', referral.id)

    if (isRefer) {
      expect(referralService.getStatusTransitions).toHaveBeenCalledWith(username, referral.id)
    } else {
      expect(referralService.getStatusTransitions).not.toHaveBeenCalled()
    }
  }
})
