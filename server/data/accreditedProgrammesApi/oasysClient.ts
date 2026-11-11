/* istanbul ignore file */
import { RestClient } from '@ministryofjustice/hmpps-rest-client'

import logger from '../../../logger'
import config from '../../config'
import { apiPaths } from '../../paths'
import type {
  AssessmentDateInfo,
  DrugAlcoholDetail,
  Health,
  OffenceDetail,
  RisksAndAlerts,
  RoshAnalysis,
} from '@accredited-programmes/models'
import type {
  Attitude,
  Behaviour,
  LearningNeeds,
  Lifestyle,
  Psychiatric,
  Referral,
  Relationships,
} from '@accredited-programmes-api'
import type { SystemToken } from '@hmpps-auth'

export default class OasysClient {
  restClient: RestClient

  constructor(private readonly token: SystemToken) {
    this.restClient = new RestClient('oasysClient', config.apis.accreditedProgrammesApi, logger)
  }

  async findAssessmentDateInfo(prisonNumber: Referral['prisonNumber']): Promise<AssessmentDateInfo> {
    return (await this.restClient.get(
      {
        path: apiPaths.oasys.assessmentDate({ prisonNumber }),
      },
      this.token,
    )) as AssessmentDateInfo
  }

  async findAttitude(prisonNumber: Referral['prisonNumber']): Promise<Attitude> {
    return (await this.restClient.get(
      {
        path: apiPaths.oasys.attitude({ prisonNumber }),
      },
      this.token,
    )) as Attitude
  }

  async findBehaviour(prisonNumber: Referral['prisonNumber']): Promise<Behaviour> {
    return (await this.restClient.get(
      {
        path: apiPaths.oasys.behaviour({ prisonNumber }),
      },
      this.token,
    )) as Behaviour
  }

  async findDrugAndAlcoholDetails(prisonNumber: Referral['prisonNumber']): Promise<DrugAlcoholDetail> {
    return (await this.restClient.get(
      {
        path: apiPaths.oasys.drugAndAlcoholDetails({ prisonNumber }),
      },
      this.token,
    )) as DrugAlcoholDetail
  }

  async findHealth(prisonNumber: Referral['prisonNumber']): Promise<Health> {
    return (await this.restClient.get(
      {
        path: apiPaths.oasys.health({ prisonNumber }),
      },
      this.token,
    )) as Health
  }

  async findLearningNeeds(prisonNumber: Referral['prisonNumber']): Promise<LearningNeeds> {
    return (await this.restClient.get(
      {
        path: apiPaths.oasys.learningNeeds({ prisonNumber }),
      },
      this.token,
    )) as LearningNeeds
  }

  async findLifestyle(prisonNumber: Referral['prisonNumber']): Promise<Lifestyle> {
    return (await this.restClient.get(
      {
        path: apiPaths.oasys.lifestyle({ prisonNumber }),
      },
      this.token,
    )) as Lifestyle
  }

  async findOffenceDetails(prisonNumber: Referral['prisonNumber']): Promise<OffenceDetail> {
    return (await this.restClient.get(
      {
        path: apiPaths.oasys.offenceDetails({ prisonNumber }),
      },
      this.token,
    )) as OffenceDetail
  }

  async findPsychiatric(prisonNumber: Referral['prisonNumber']): Promise<Psychiatric> {
    return (await this.restClient.get(
      {
        path: apiPaths.oasys.psychiatric({ prisonNumber }),
      },
      this.token,
    )) as Psychiatric
  }

  async findRelationships(prisonNumber: Referral['prisonNumber']): Promise<Relationships> {
    return (await this.restClient.get(
      {
        path: apiPaths.oasys.relationships({ prisonNumber }),
      },
      this.token,
    )) as Relationships
  }

  async findRisksAndAlerts(prisonNumber: Referral['prisonNumber']): Promise<RisksAndAlerts> {
    return (await this.restClient.get(
      {
        path: apiPaths.oasys.risksAndAlerts({ prisonNumber }),
      },
      this.token,
    )) as RisksAndAlerts
  }

  async findRoshAnalysis(prisonNumber: Referral['prisonNumber']): Promise<RoshAnalysis> {
    return (await this.restClient.get(
      {
        path: apiPaths.oasys.roshAnalysis({ prisonNumber }),
      },
      this.token,
    )) as RoshAnalysis
  }
}
