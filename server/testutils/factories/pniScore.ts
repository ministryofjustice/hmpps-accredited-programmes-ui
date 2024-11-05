import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import FactoryHelpers from './factoryHelpers'
import type { PniScore } from '@accredited-programmes-api'

export default Factory.define<PniScore>(() => {
  return {
    NeedsScore: {
      DomainScore: {
        RelationshipDomainScore: {
          individualRelationshipScores: {
            aggressiveControllingBehaviour: FactoryHelpers.optionalNumber(3),
            curRelCloseFamily: FactoryHelpers.optionalNumber(3),
            easilyInfluenced: FactoryHelpers.optionalNumber(3),
            prevExpCloseRel: FactoryHelpers.optionalNumber(3),
          },
          isAllValuesPresent: [],
          overallRelationshipDomainScore: faker.number.int({ max: 3, min: 0 }),
        },
        SelfManagementDomainScore: {
          individualSelfManagementScores: {
            difficultiesCoping: FactoryHelpers.optionalNumber(3),
            impulsivity: FactoryHelpers.optionalNumber(3),
            problemSolvingSkills: FactoryHelpers.optionalNumber(3),
            temperControl: FactoryHelpers.optionalNumber(3),
          },
          isAllValuesPresent: [],
          overallSelfManagementDomainScore: faker.number.int({ max: 3, min: 0 }),
        },
        SexDomainScore: {
          individualSexScores: {
            emotionalCongruence: FactoryHelpers.optionalNumber(3),
            isAllValuesPresent: false,
            offenceRelatedSexualInterests: FactoryHelpers.optionalNumber(3),
            sexualPreOccupation: FactoryHelpers.optionalNumber(3),
          },
          overallSexDomainScore: faker.number.int({ max: 3, min: 0 }),
        },
        ThinkingDomainScore: {
          individualThinkingScores: {
            hostileOrientation: FactoryHelpers.optionalNumber(3),
            proCriminalAttitudes: FactoryHelpers.optionalNumber(3),
          },
          isAllValuesPresent: [],
          overallThinkingDomainScore: faker.number.int({ max: 3, min: 0 }),
        },
      },
      classification: faker.helpers.arrayElement(['HIGH_NEED', 'MEDIUM_NEED', 'LOW_NEED']),
      overallNeedsScore: faker.number.int({ max: 3, min: 0 }),
    },
    RiskScore: {
      IndividualRiskScores: {
        ogrs3: FactoryHelpers.optionalNumber(3),
        ospDc: FactoryHelpers.optionalNumber(3)?.toString(),
        ospIic: FactoryHelpers.optionalNumber(3)?.toString(),
        ovp: FactoryHelpers.optionalNumber(3),
        rsr: FactoryHelpers.optionalNumber(3),
        sara: {
          sara: FactoryHelpers.optionalArrayElement(['LOW', 'MEDIUM', 'HIGH']),
        },
      },
      classification: faker.helpers.arrayElement(['HIGH_RISK', 'MEDIUM_RISK', 'LOW_RISK']),
    },
    assessmentId: faker.number.int(),
    crn: faker.string.alphanumeric({ length: 7 }),
    prisonNumber: faker.string.alphanumeric({ length: 7 }),
    programmePathway: faker.helpers.arrayElement(['HIGH_INTENSITY_BC', 'MODERATE_INTENSITY_BC', 'ALTERNATIVE_PATHWAY']),
    validationErrors: [],
  }
})
