import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { when } from 'jest-when'

import RisksAndNeedsController from './risksAndNeedsController'
import { referPaths } from '../../paths'
import type { CourseService, OasysService, PersonService, ReferralService } from '../../services'
import {
  attitudeFactory,
  behaviourFactory,
  courseFactory,
  courseOfferingFactory,
  healthFactory,
  learningNeedsFactory,
  lifestyleFactory,
  offenceDetailFactory,
  organisationFactory,
  personFactory,
  psychiatricFactory,
  referralFactory,
  relationshipsFactory,
  risksFactory,
  roshAnalysisFactory,
} from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import {
  AttitudesUtils,
  CourseUtils,
  DateUtils,
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
import type { Referral } from '@accredited-programmes/api'
import type { OspBox, Person, RiskBox, RisksAndNeedsSharedPageData } from '@accredited-programmes/ui'

jest.mock('../../utils/dateUtils')
jest.mock('../../utils/referrals/showReferralUtils')
jest.mock('../../utils/referrals/showRisksAndNeedsUtils')
jest.mock('../../utils/risksAndNeeds/attitudesUtils')
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
const mockAttitudesUtils = AttitudesUtils as jest.Mocked<typeof AttitudesUtils>
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

  describe('attitudes', () => {
    it('renders the attitudes page with the correct response locals', async () => {
      const attitudes = attitudeFactory.build()
      const attitudesSummaryListRows = [{ key: { text: 'key-one' }, value: { text: 'value one' } }]

      mockAttitudesUtils.attitudesSummaryListRows.mockReturnValue(attitudesSummaryListRows)

      when(oasysService.getAttitude).calledWith(username, person.prisonNumber).mockResolvedValue(attitudes)

      request.path = referPaths.show.risksAndNeeds.attitudes({ referralId: referral.id })

      const requestHandler = controller.attitudes()
      await requestHandler(request, response, next)

      assertSharedDataServicesAreCalledWithExpectedArguments()

      expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/attitudes', {
        ...sharedPageData,
        attitudesSummaryListRows,
        importedFromText: `Imported from OASys on ${importedFromDate}.`,
        navigationItems,
        noAttitude: true,
        subNavigationItems,
      })
    })

    describe('when the oasys service returns `null`', () => {
      it('renders the attitudes page with the correct response locals', async () => {
        when(oasysService.getAttitude).calledWith(username, person.prisonNumber).mockResolvedValue(null)

        request.path = referPaths.show.risksAndNeeds.attitudes({ referralId: referral.id })

        const requestHandler = controller.attitudes()
        await requestHandler(request, response, next)

        assertSharedDataServicesAreCalledWithExpectedArguments()

        expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/attitudes', {
          ...sharedPageData,
          navigationItems,
          noAttitude: false,
          subNavigationItems,
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

      assertSharedDataServicesAreCalledWithExpectedArguments()

      expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/learningNeeds', {
        ...sharedPageData,
        hasLearningNeeds: true,
        importedFromText: `Imported from OASys on ${importedFromDate}.`,
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

        assertSharedDataServicesAreCalledWithExpectedArguments()

        expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/learningNeeds', {
          ...sharedPageData,
          hasLearningNeeds: false,
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

      assertSharedDataServicesAreCalledWithExpectedArguments()

      expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/health', {
        ...sharedPageData,
        hasHealthData: true,
        healthSummaryListRows,
        importedFromText: `Imported from OASys on ${importedFromDate}.`,
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

        assertSharedDataServicesAreCalledWithExpectedArguments()

        expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/health', {
          ...sharedPageData,
          hasHealthData: false,
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

  describe('risksAndAlerts', () => {
    it('renders the risks and alerts page with the correct response locals', async () => {
      const risks = risksFactory
        .withAllOptionalFields()
        .build({ imminentRiskOfViolenceTowardsOthers: 'LOW', imminentRiskOfViolenceTowardsPartner: 'HIGH' })
      const ogrsYear1Box: RiskBox = {
        category: 'OGRS Year 1',
        dataTestId: 'ogrs-year-1-risk-box',
        figure: '65.6%',
        levelClass: 'risk-box--low',
        levelText: 'LOW',
      }
      const ogrsYear2Box: RiskBox = {
        category: 'OGRS Year 2',
        dataTestId: 'ogrs-year-2-risk-box',
        figure: '89.1%',
        levelClass: 'risk-box--low',
        levelText: 'LOW',
      }
      const ospcBox: OspBox = { dataTestId: 'osp-c-box', levelClass: 'osp-box--low', levelText: 'LOW', type: 'OSP/C' }
      const ospiBox: OspBox = { dataTestId: 'ocp-i-box', levelClass: 'osp-box--low', levelText: 'LOW', type: 'OSP/I' }
      const ovpYear1Box: RiskBox = {
        category: 'OVP Year 1',
        dataTestId: 'ovp-year-1-risk-box',
        figure: '70.2%',
        levelClass: 'risk-box--low',
        levelText: 'LOW',
      }
      const ovpYear2Box: RiskBox = {
        category: 'OVP Year 2',
        dataTestId: 'ovp-year-2-risk-box',
        figure: '78.5%',
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
        figure: '32.3',
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

      when(oasysService.getRisks).calledWith(username, person.prisonNumber).mockResolvedValue(risks)
      when(mockRisksAndAlertsUtils.riskBox)
        .calledWith('OGRS Year 1', risks.ogrsRisk, `${risks.ogrsYear1?.toString()}%`)
        .mockReturnValue(ogrsYear1Box)
      when(mockRisksAndAlertsUtils.riskBox)
        .calledWith('OGRS Year 2', risks.ogrsRisk, `${risks.ogrsYear2?.toString()}%`)
        .mockReturnValue(ogrsYear2Box)
      when(mockRisksAndAlertsUtils.ospBox).calledWith('OSP/C', risks.ospcScore).mockReturnValue(ospcBox)
      when(mockRisksAndAlertsUtils.ospBox).calledWith('OSP/I', risks.ospiScore).mockReturnValue(ospiBox)
      when(mockRisksAndAlertsUtils.riskBox)
        .calledWith('OVP Year 1', risks.ovpRisk, `${risks.ovpYear1?.toString()}%`)
        .mockReturnValue(ovpYear1Box)
      when(mockRisksAndAlertsUtils.riskBox)
        .calledWith('OVP Year 2', risks.ovpRisk, `${risks.ovpYear2?.toString()}%`)
        .mockReturnValue(ovpYear2Box)
      when(mockRisksAndAlertsUtils.riskBox).calledWith('RoSH', risks.overallRoshLevel).mockReturnValue(roshBox)
      mockRisksAndAlertsUtils.roshTable.mockReturnValue(roshTable)
      when(mockRisksAndAlertsUtils.riskBox)
        .calledWith('RSR', risks.rsrRisk, risks.rsrScore?.toString())
        .mockReturnValue(rsrBox)
      when(mockRisksAndAlertsUtils.riskBox)
        .calledWith('SARA', risks.imminentRiskOfViolenceTowardsOthers, undefined, 'sara-others')
        .mockReturnValue(saraOthersBox)
      when(mockRisksAndAlertsUtils.riskBox)
        .calledWith('SARA', risks.imminentRiskOfViolenceTowardsPartner, undefined, 'sara-partner')
        .mockReturnValue(saraPartnerBox)

      request.path = referPaths.show.risksAndNeeds.risksAndAlerts({ referralId: referral.id })

      const requestHandler = controller.risksAndAlerts()
      await requestHandler(request, response, next)

      assertSharedDataServicesAreCalledWithExpectedArguments()

      expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/risksAndAlerts', {
        ...sharedPageData,
        alerts: risks.alerts,
        hasRisks: true,
        importedFromNomisText: `Imported from Nomis on ${importedFromDate}.`,
        importedFromOasysText: `Imported from OASys on ${importedFromDate}.`,
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
        when(oasysService.getRisks).calledWith(username, person.prisonNumber).mockResolvedValue(null)

        request.path = referPaths.show.risksAndNeeds.risksAndAlerts({ referralId: referral.id })

        const requestHandler = controller.risksAndAlerts()
        await requestHandler(request, response, next)

        assertSharedDataServicesAreCalledWithExpectedArguments()

        expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/risksAndAlerts', {
          ...sharedPageData,
          hasRisks: false,
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

      assertSharedDataServicesAreCalledWithExpectedArguments()

      expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/thinkingAndBehaving', {
        ...sharedPageData,
        hasBehaviourData: true,
        importedFromText: `Imported from OASys on ${importedFromDate}.`,
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

        assertSharedDataServicesAreCalledWithExpectedArguments()

        expect(response.render).toHaveBeenCalledWith('referrals/show/risksAndNeeds/thinkingAndBehaving', {
          ...sharedPageData,
          hasBehaviourData: false,
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
