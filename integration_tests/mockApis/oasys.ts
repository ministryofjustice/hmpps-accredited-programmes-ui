import type { SuperAgentRequest } from 'superagent'

import { apiPaths } from '../../server/paths'
import { stubFor } from '../../wiremock'
import type {
  Behaviour,
  Lifestyle,
  OffenceDetail,
  Psychiatric,
  Referral,
  Relationships,
  RoshAnalysis,
} from '@accredited-programmes/models'

export default {
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
