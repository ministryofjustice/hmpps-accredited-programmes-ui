/* istanbul ignore file */
import config, { type ApiConfig } from '../../config'
import { apiPaths } from '../../paths'
import RestClient from '../restClient'
import type {
  AssessmentDateInfo,
  DrugAlcoholDetail,
  Health,
  LearningNeeds,
  OffenceDetail,
  RisksAndAlerts,
  RoshAnalysis,
} from '@accredited-programmes/models'
import type { Attitude, Behaviour, Lifestyle, Psychiatric, Referral, Relationships } from '@accredited-programmes-api'
import type { SystemToken } from '@hmpps-auth'

export default class OasysClient {
  restClient: RestClient

  constructor(systemToken: SystemToken) {
    this.restClient = new RestClient('oasysClient', config.apis.accreditedProgrammesApi as ApiConfig, systemToken)
  }

  async findAssessmentDateInfo(prisonNumber: Referral['prisonNumber']): Promise<AssessmentDateInfo> {
    return (await this.restClient.get({
      path: apiPaths.oasys.assessmentDate({ prisonNumber }),
    })) as AssessmentDateInfo
  }

  async findAttitude(prisonNumber: Referral['prisonNumber']): Promise<Attitude> {
    return (await this.restClient.get({
      path: apiPaths.oasys.attitude({ prisonNumber }),
    })) as Attitude
  }

  async findBehaviour(prisonNumber: Referral['prisonNumber']): Promise<Behaviour> {
    return (await this.restClient.get({
      path: apiPaths.oasys.behaviour({ prisonNumber }),
    })) as Behaviour
  }

  async findDrugAndAlcoholDetails(prisonNumber: Referral['prisonNumber']): Promise<DrugAlcoholDetail> {
    return (await this.restClient.get({
      path: apiPaths.oasys.drugAndAlcoholDetails({ prisonNumber }),
    })) as DrugAlcoholDetail
  }

  async findHealth(prisonNumber: Referral['prisonNumber']): Promise<Health> {
    return (await this.restClient.get({
      path: apiPaths.oasys.health({ prisonNumber }),
    })) as Health
  }

  async findLearningNeeds(prisonNumber: Referral['prisonNumber']): Promise<LearningNeeds> {
    return (await this.restClient.get({
      path: apiPaths.oasys.learningNeeds({ prisonNumber }),
    })) as LearningNeeds
  }

  async findLifestyle(prisonNumber: Referral['prisonNumber']): Promise<Lifestyle> {
    return (await this.restClient.get({
      path: apiPaths.oasys.lifestyle({ prisonNumber }),
    })) as Lifestyle
  }

  async findOffenceDetails(prisonNumber: Referral['prisonNumber']): Promise<OffenceDetail> {
    return (await this.restClient.get({
      path: apiPaths.oasys.offenceDetails({ prisonNumber }),
    })) as OffenceDetail
  }

  async findPsychiatric(prisonNumber: Referral['prisonNumber']): Promise<Psychiatric> {
    return (await this.restClient.get({
      path: apiPaths.oasys.psychiatric({ prisonNumber }),
    })) as Psychiatric
  }

  async findRelationships(prisonNumber: Referral['prisonNumber']): Promise<Relationships> {
    return (await this.restClient.get({
      path: apiPaths.oasys.relationships({ prisonNumber }),
    })) as Relationships
  }

  async findRisksAndAlerts(prisonNumber: Referral['prisonNumber']): Promise<RisksAndAlerts> {
    return (await this.restClient.get({
      path: apiPaths.oasys.risksAndAlerts({ prisonNumber }),
    })) as RisksAndAlerts
  }

  async findRoshAnalysis(prisonNumber: Referral['prisonNumber']): Promise<RoshAnalysis> {
    return (await this.restClient.get({
      path: apiPaths.oasys.roshAnalysis({ prisonNumber }),
    })) as RoshAnalysis
  }
}
