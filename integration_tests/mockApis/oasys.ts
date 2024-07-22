import type { SuperAgentRequest } from 'superagent'

import { apiPaths } from '../../server/paths'
import { stubFor } from '../../wiremock'
import type {
  AssessmentDateInfo,
  Attitude,
  Behaviour,
  DrugAlcoholDetail,
  Health,
  LearningNeeds,
  Lifestyle,
  OffenceDetail,
  Psychiatric,
  Referral,
  Relationships,
  RisksAndAlerts,
  RoshAnalysis,
} from '@accredited-programmes/models'

export default {
  stubAssessmentDateInfo: (args: {
    assessmentDateInfo: AssessmentDateInfo
    prisonNumber: Referral['prisonNumber']
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.oasys.assessmentDate({ prisonNumber: args.prisonNumber }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.assessmentDateInfo,
        status: 200,
      },
    }),

  stubAttitude: (args: { attitude: Attitude; prisonNumber: Referral['prisonNumber'] }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.oasys.attitude({ prisonNumber: args.prisonNumber }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.attitude,
        status: 200,
      },
    }),

  stubBehaviour: (args: { behaviour: Behaviour; prisonNumber: Referral['prisonNumber'] }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.oasys.behaviour({ prisonNumber: args.prisonNumber }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.behaviour,
        status: 200,
      },
    }),

  stubDrugAndAlcoholDetails: (args: {
    drugAndAlcoholDetails: DrugAlcoholDetail
    prisonNumber: Referral['prisonNumber']
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.oasys.drugAndAlcoholDetails({ prisonNumber: args.prisonNumber }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.drugAndAlcoholDetails,
        status: 200,
      },
    }),

  stubHealth: (args: { health: Health; prisonNumber: Referral['prisonNumber'] }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.oasys.health({ prisonNumber: args.prisonNumber }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.health,
        status: 200,
      },
    }),

  stubLearningNeeds: (args: {
    learningNeeds: LearningNeeds
    prisonNumber: Referral['prisonNumber']
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.oasys.learningNeeds({ prisonNumber: args.prisonNumber }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.learningNeeds,
        status: 200,
      },
    }),

  stubLifestyle: (args: { lifestyle: Lifestyle; prisonNumber: Referral['prisonNumber'] }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.oasys.lifestyle({ prisonNumber: args.prisonNumber }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.lifestyle,
        status: 200,
      },
    }),

  stubOffenceDetails: (args: {
    offenceDetail: OffenceDetail
    prisonNumber: Referral['prisonNumber']
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.oasys.offenceDetails({ prisonNumber: args.prisonNumber }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.offenceDetail,
        status: 200,
      },
    }),

  stubPsychiatric: (args: { prisonNumber: Referral['prisonNumber']; psychiatric: Psychiatric }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.oasys.psychiatric({ prisonNumber: args.prisonNumber }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.psychiatric,
        status: 200,
      },
    }),

  stubRelationships: (args: {
    prisonNumber: Referral['prisonNumber']
    relationships: Relationships
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.oasys.relationships({ prisonNumber: args.prisonNumber }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.relationships,
        status: 200,
      },
    }),

  stubRisksAndAlerts: (args: {
    prisonNumber: Referral['prisonNumber']
    risksAndAlerts: RisksAndAlerts
    status?: number
  }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.oasys.risksAndAlerts({ prisonNumber: args.prisonNumber }),
      },
      response: {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: args.risksAndAlerts,
        status: args.status || 200,
      },
    }),

  stubRoshAnalysis: (args: { prisonNumber: Referral['prisonNumber']; roshAnalysis: RoshAnalysis }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.oasys.roshAnalysis({ prisonNumber: args.prisonNumber }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.roshAnalysis,
        status: 200,
      },
    }),
}
