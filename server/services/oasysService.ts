import createError from 'http-errors'
import type { ResponseError } from 'superagent'

import type { HmppsAuthClient, OasysClient, RestClientBuilder, RestClientBuilderWithoutToken } from '../data'
import type {
  AssessmentDateInfo,
  Attitude,
  DrugAlcoholDetail,
  Health,
  LearningNeeds,
  OffenceDetail,
  Referral,
  RisksAndAlerts,
  RoshAnalysis,
} from '@accredited-programmes/models'
import type { Behaviour, Lifestyle, Psychiatric, Relationships } from '@accredited-programmes-api'

export default class OasysService {
  constructor(
    private readonly hmppsAuthClientBuilder: RestClientBuilderWithoutToken<HmppsAuthClient>,
    private readonly oasysClientBuilder: RestClientBuilder<OasysClient>,
  ) {}

  async getAssessmentDateInfo(
    username: Express.User['username'],
    prisonNumber: Referral['prisonNumber'],
  ): Promise<AssessmentDateInfo | null> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const oasysClient = this.oasysClientBuilder(systemToken)

    try {
      const assessmentDateInfo = await oasysClient.findAssessmentDateInfo(prisonNumber)

      return assessmentDateInfo
    } catch (error) {
      const knownError = error as ResponseError

      if (knownError.status === 404) {
        return null
      }

      throw createError(
        knownError.status || 500,
        `Error fetching assessment date info for prison number ${prisonNumber}.`,
      )
    }
  }

  async getAttitude(
    username: Express.User['username'],
    prisonNumber: Referral['prisonNumber'],
  ): Promise<Attitude | null> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const oasysClient = this.oasysClientBuilder(systemToken)

    try {
      const attitude = await oasysClient.findAttitude(prisonNumber)

      return attitude
    } catch (error) {
      const knownError = error as ResponseError

      if (knownError.status === 404) {
        return null
      }

      throw createError(knownError.status || 500, `Error fetching attitude data for prison number ${prisonNumber}.`)
    }
  }

  async getBehaviour(
    username: Express.User['username'],
    prisonNumber: Referral['prisonNumber'],
  ): Promise<Behaviour | null> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const oasysClient = this.oasysClientBuilder(systemToken)

    try {
      const behaviour = await oasysClient.findBehaviour(prisonNumber)

      return behaviour
    } catch (error) {
      const knownError = error as ResponseError

      if (knownError.status === 404) {
        return null
      }

      throw createError(knownError.status || 500, `Error fetching behaviour data for prison number ${prisonNumber}.`)
    }
  }

  async getDrugAndAlcoholDetails(
    username: Express.User['username'],
    prisonNumber: Referral['prisonNumber'],
  ): Promise<DrugAlcoholDetail | null> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const oasysClient = this.oasysClientBuilder(systemToken)

    try {
      const drugAndAlcoholDetails = await oasysClient.findDrugAndAlcoholDetails(prisonNumber)

      return drugAndAlcoholDetails
    } catch (error) {
      const knownError = error as ResponseError

      if (knownError.status === 404) {
        return null
      }

      throw createError(
        knownError.status || 500,
        `Error fetching drug and alcohol details for prison number ${prisonNumber}.`,
      )
    }
  }

  async getHealth(username: Express.User['username'], prisonNumber: Referral['prisonNumber']): Promise<Health | null> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const oasysClient = this.oasysClientBuilder(systemToken)

    try {
      const health = await oasysClient.findHealth(prisonNumber)

      return health
    } catch (error) {
      const knownError = error as ResponseError

      if (knownError.status === 404) {
        return null
      }

      throw createError(knownError.status || 500, `Error fetching health data for prison number ${prisonNumber}.`)
    }
  }

  async getLearningNeeds(
    username: Express.User['username'],
    prisonNumber: Referral['prisonNumber'],
  ): Promise<LearningNeeds | null> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const oasysClient = this.oasysClientBuilder(systemToken)

    try {
      const learningNeeds = await oasysClient.findLearningNeeds(prisonNumber)

      return learningNeeds
    } catch (error) {
      const knownError = error as ResponseError

      if (knownError.status === 404) {
        return null
      }

      throw createError(
        knownError.status || 500,
        `Error fetching learning needs data for prison number ${prisonNumber}.`,
      )
    }
  }

  async getLifestyle(
    username: Express.User['username'],
    prisonNumber: Referral['prisonNumber'],
  ): Promise<Lifestyle | null> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const oasysClient = this.oasysClientBuilder(systemToken)

    try {
      const lifestyle = await oasysClient.findLifestyle(prisonNumber)

      return lifestyle
    } catch (error) {
      const knownError = error as ResponseError

      if (knownError.status === 404) {
        return null
      }

      throw createError(knownError.status || 500, `Error fetching lifestyle data for prison number ${prisonNumber}.`)
    }
  }

  async getOffenceDetails(
    username: Express.User['username'],
    prisonNumber: Referral['prisonNumber'],
  ): Promise<OffenceDetail | null> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const oasysClient = this.oasysClientBuilder(systemToken)

    try {
      const offenceDetails = await oasysClient.findOffenceDetails(prisonNumber)

      return offenceDetails
    } catch (error) {
      const knownError = error as ResponseError

      if (knownError.status === 404) {
        return null
      }

      throw createError(knownError.status || 500, `Error fetching offence details for prison number ${prisonNumber}.`)
    }
  }

  async getPsychiatric(
    username: Express.User['username'],
    prisonNumber: Referral['prisonNumber'],
  ): Promise<Psychiatric | null> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const oasysClient = this.oasysClientBuilder(systemToken)

    try {
      const psychiatric = await oasysClient.findPsychiatric(prisonNumber)

      return psychiatric
    } catch (error) {
      const knownError = error as ResponseError

      if (knownError.status === 404) {
        return null
      }

      throw createError(knownError.status || 500, `Error fetching psychiatric data for prison number ${prisonNumber}.`)
    }
  }

  async getRelationships(
    username: Express.User['username'],
    prisonNumber: Referral['prisonNumber'],
  ): Promise<Relationships | null> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const oasysClient = this.oasysClientBuilder(systemToken)

    try {
      const relationships = await oasysClient.findRelationships(prisonNumber)

      return relationships
    } catch (error) {
      const knownError = error as ResponseError

      if (knownError.status === 404) {
        return null
      }

      throw createError(knownError.status || 500, `Error fetching relationships for prison number ${prisonNumber}.`)
    }
  }

  async getRisksAndAlerts(
    username: Express.User['username'],
    prisonNumber: Referral['prisonNumber'],
  ): Promise<RisksAndAlerts | null> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const oasysClient = this.oasysClientBuilder(systemToken)

    try {
      const risksAndAlerts = await oasysClient.findRisksAndAlerts(prisonNumber)

      return risksAndAlerts
    } catch (error) {
      const knownError = error as ResponseError

      if (knownError.status === 404) {
        return null
      }

      throw createError(knownError.status || 500, `Error fetching risks and alerts for prison number ${prisonNumber}.`)
    }
  }

  async getRoshAnalysis(
    username: Express.User['username'],
    prisonNumber: Referral['prisonNumber'],
  ): Promise<RoshAnalysis | null> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const oasysClient = this.oasysClientBuilder(systemToken)

    try {
      const roshAnalysis = await oasysClient.findRoshAnalysis(prisonNumber)

      return roshAnalysis
    } catch (error) {
      const knownError = error as ResponseError

      if (knownError.status === 404) {
        return null
      }

      throw createError(knownError.status || 500, `Error fetching RoSH analysis for prison number ${prisonNumber}.`)
    }
  }
}
