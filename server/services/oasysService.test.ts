import { createMock } from '@golevelup/ts-jest'
import createError from 'http-errors'
import { when } from 'jest-when'

import OasysService from './oasysService'
import type { RedisClient } from '../data'
import { HmppsAuthClient, OasysClient, TokenStore } from '../data'
import {
  attitudeFactory,
  behaviourFactory,
  drugAlcoholDetailFactory,
  healthFactory,
  learningNeedsFactory,
  lifestyleFactory,
  offenceDetailFactory,
  psychiatricFactory,
  relationshipsFactory,
  risksAndAlertsFactory,
  roshAnalysisFactory,
} from '../testutils/factories'

jest.mock('../data/accreditedProgrammesApi/oasysClient')
jest.mock('../data/hmppsAuthClient')

const redisClient = createMock<RedisClient>({})
const tokenStore = new TokenStore(redisClient) as jest.Mocked<TokenStore>
const systemToken = 'some system token'
const username = 'USERNAME'
const prisonNumber = 'PRISONNUMBER'

describe('OasysService', () => {
  const oasysClient = new OasysClient(systemToken) as jest.Mocked<OasysClient>
  const oasysClientBuilder = jest.fn()

  const hmppsAuthClient = new HmppsAuthClient(tokenStore) as jest.Mocked<HmppsAuthClient>
  const hmppsAuthClientBuilder = jest.fn()

  const service = new OasysService(hmppsAuthClientBuilder, oasysClientBuilder)

  const notFoundClientError = createError(404)
  const generalClientError = createError(500)
  const unknownError = new Error('Unknown error')

  beforeEach(() => {
    jest.resetAllMocks()

    hmppsAuthClientBuilder.mockReturnValue(hmppsAuthClient)
    oasysClientBuilder.mockReturnValue(oasysClient)
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(systemToken)
  })

  describe('getAttitude', () => {
    it('returns attitude data for given prison number', async () => {
      const attitude = attitudeFactory.build()

      when(oasysClient.findAttitude).calledWith(prisonNumber).mockResolvedValue(attitude)

      const result = await service.getAttitude(username, prisonNumber)

      expect(result).toEqual(attitude)

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)

      expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(oasysClient.findAttitude).toHaveBeenCalledWith(prisonNumber)
    })

    describe('when the oasys client throws a 404 error', () => {
      it('returns null', async () => {
        when(oasysClient.findAttitude).calledWith(prisonNumber).mockRejectedValue(notFoundClientError)

        const result = await service.getAttitude(username, prisonNumber)
        expect(result).toBeNull()

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findAttitude).toHaveBeenCalledWith(prisonNumber)
      })
    })

    describe('when the oasys client throws a 500 error', () => {
      it('throws an error', async () => {
        when(oasysClient.findAttitude).calledWith(prisonNumber).mockRejectedValue(generalClientError)

        const expectedError = createError(500, `Error fetching attitude data for prison number ${prisonNumber}.`)
        await expect(service.getAttitude(username, prisonNumber)).rejects.toThrow(expectedError)

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findAttitude).toHaveBeenCalledWith(prisonNumber)
      })
    })

    describe('when the oasys client throws an unknown error', () => {
      it('throws a 500 error', async () => {
        when(oasysClient.findAttitude).calledWith(prisonNumber).mockRejectedValue(unknownError)

        const expectedError = createError(500, `Error fetching attitude data for prison number ${prisonNumber}.`)
        await expect(service.getAttitude(username, prisonNumber)).rejects.toThrow(expectedError)

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findAttitude).toHaveBeenCalledWith(prisonNumber)
      })
    })
  })

  describe('getBehaviour', () => {
    it('returns behaviour data for given prison number', async () => {
      const behaviour = behaviourFactory.build()

      when(oasysClient.findBehaviour).calledWith(prisonNumber).mockResolvedValue(behaviour)

      const result = await service.getBehaviour(username, prisonNumber)

      expect(result).toEqual(behaviour)

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)

      expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(oasysClient.findBehaviour).toHaveBeenCalledWith(prisonNumber)
    })

    describe('when the oasys client throws a 404 error', () => {
      it('returns null', async () => {
        when(oasysClient.findBehaviour).calledWith(prisonNumber).mockRejectedValue(notFoundClientError)

        const result = await service.getBehaviour(username, prisonNumber)
        expect(result).toBeNull()

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findBehaviour).toHaveBeenCalledWith(prisonNumber)
      })
    })

    describe('when the oasys client throws a 500 error', () => {
      it('throws an error', async () => {
        when(oasysClient.findBehaviour).calledWith(prisonNumber).mockRejectedValue(generalClientError)

        const expectedError = createError(500, `Error fetching behaviour data for prison number ${prisonNumber}.`)
        await expect(service.getBehaviour(username, prisonNumber)).rejects.toThrow(expectedError)

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findBehaviour).toHaveBeenCalledWith(prisonNumber)
      })
    })

    describe('when the oasys client throws an unknown error', () => {
      it('throws a 500 error', async () => {
        when(oasysClient.findBehaviour).calledWith(prisonNumber).mockRejectedValue(unknownError)

        const expectedError = createError(500, `Error fetching behaviour data for prison number ${prisonNumber}.`)
        await expect(service.getBehaviour(username, prisonNumber)).rejects.toThrow(expectedError)

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findBehaviour).toHaveBeenCalledWith(prisonNumber)
      })
    })
  })

  describe('getDrugAndAlcoholDetails', () => {
    it('returns drug and alcohol details for given prison number', async () => {
      const drugAndAlcoholDetails = drugAlcoholDetailFactory.build()

      when(oasysClient.findDrugAndAlcoholDetails).calledWith(prisonNumber).mockResolvedValue(drugAndAlcoholDetails)

      const result = await service.getDrugAndAlcoholDetails(username, prisonNumber)

      expect(result).toEqual(drugAndAlcoholDetails)

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)

      expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(oasysClient.findDrugAndAlcoholDetails).toHaveBeenCalledWith(prisonNumber)
    })

    describe('when the oasys client throws a 404 error', () => {
      it('returns null', async () => {
        when(oasysClient.findDrugAndAlcoholDetails).calledWith(prisonNumber).mockRejectedValue(notFoundClientError)

        const result = await service.getDrugAndAlcoholDetails(username, prisonNumber)
        expect(result).toBeNull()

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findDrugAndAlcoholDetails).toHaveBeenCalledWith(prisonNumber)
      })
    })

    describe('when the oasys client throws a 500 error', () => {
      it('throws an error', async () => {
        when(oasysClient.findDrugAndAlcoholDetails).calledWith(prisonNumber).mockRejectedValue(generalClientError)

        const expectedError = createError(
          500,
          `Error fetching drug and alcohol details for prison number ${prisonNumber}.`,
        )
        await expect(service.getDrugAndAlcoholDetails(username, prisonNumber)).rejects.toThrow(expectedError)

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findDrugAndAlcoholDetails).toHaveBeenCalledWith(prisonNumber)
      })
    })

    describe('when the oasys client throws an unknown error', () => {
      it('throws a 500 error', async () => {
        when(oasysClient.findDrugAndAlcoholDetails)
          .calledWith(prisonNumber)
          .mockRejectedValue(unknownError)

        const expectedError = createError(
          500,
          `Error fetching drug and alcohol details for prison number ${prisonNumber}.`,
        )
        await expect(service.getDrugAndAlcoholDetails(username, prisonNumber)).rejects.toThrow(expectedError)

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findDrugAndAlcoholDetails).toHaveBeenCalledWith(prisonNumber)
      })
    })
  })

  describe('getHealth', () => {
    it('returns health data for given prison number', async () => {
      const health = healthFactory.build()

      when(oasysClient.findHealth).calledWith(prisonNumber).mockResolvedValue(health)

      const result = await service.getHealth(username, prisonNumber)

      expect(result).toEqual(health)

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)

      expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(oasysClient.findHealth).toHaveBeenCalledWith(prisonNumber)
    })

    describe('when the oasys client throws a 404 error', () => {
      it('returns null', async () => {
        when(oasysClient.findHealth).calledWith(prisonNumber).mockRejectedValue(notFoundClientError)

        const result = await service.getHealth(username, prisonNumber)
        expect(result).toBeNull()

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findHealth).toHaveBeenCalledWith(prisonNumber)
      })
    })

    describe('when the oasys client throws a 500 error', () => {
      it('throws an error', async () => {
        when(oasysClient.findHealth).calledWith(prisonNumber).mockRejectedValue(generalClientError)

        const expectedError = createError(500, `Error fetching health data for prison number ${prisonNumber}.`)
        await expect(service.getHealth(username, prisonNumber)).rejects.toThrow(expectedError)

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findHealth).toHaveBeenCalledWith(prisonNumber)
      })
    })

    describe('when the oasys client throws an unknown error', () => {
      it('throws a 500 error', async () => {
        when(oasysClient.findHealth).calledWith(prisonNumber).mockRejectedValue(unknownError)

        const expectedError = createError(500, `Error fetching health data for prison number ${prisonNumber}.`)
        await expect(service.getHealth(username, prisonNumber)).rejects.toThrow(expectedError)

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findHealth).toHaveBeenCalledWith(prisonNumber)
      })
    })
  })

  describe('getLearningNeeds', () => {
    it('returns learning needs data for given prison number', async () => {
      const learningNeeds = learningNeedsFactory.build()

      when(oasysClient.findLearningNeeds).calledWith(prisonNumber).mockResolvedValue(learningNeeds)

      const result = await service.getLearningNeeds(username, prisonNumber)

      expect(result).toEqual(learningNeeds)

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)

      expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(oasysClient.findLearningNeeds).toHaveBeenCalledWith(prisonNumber)
    })

    describe('when the oasys client throws a 404 error', () => {
      it('returns null', async () => {
        when(oasysClient.findLearningNeeds).calledWith(prisonNumber).mockRejectedValue(notFoundClientError)

        const result = await service.getLearningNeeds(username, prisonNumber)
        expect(result).toBeNull()

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findLearningNeeds).toHaveBeenCalledWith(prisonNumber)
      })
    })

    describe('when the oasys client throws a 500 error', () => {
      it('throws an error', async () => {
        when(oasysClient.findLearningNeeds).calledWith(prisonNumber).mockRejectedValue(generalClientError)

        const expectedError = createError(500, `Error fetching learning needs data for prison number ${prisonNumber}.`)
        await expect(service.getLearningNeeds(username, prisonNumber)).rejects.toThrow(expectedError)

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findLearningNeeds).toHaveBeenCalledWith(prisonNumber)
      })
    })

    describe('when the oasys client throws an unknown error', () => {
      it('throws a 500 error', async () => {
        when(oasysClient.findLearningNeeds).calledWith(prisonNumber).mockRejectedValue(unknownError)

        const expectedError = createError(500, `Error fetching learning needs data for prison number ${prisonNumber}.`)
        await expect(service.getLearningNeeds(username, prisonNumber)).rejects.toThrow(expectedError)

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findLearningNeeds).toHaveBeenCalledWith(prisonNumber)
      })
    })
  })

  describe('getLifestyle', () => {
    it('returns lifestyle data for given prison number', async () => {
      const lifestyle = lifestyleFactory.build()

      when(oasysClient.findLifestyle).calledWith(prisonNumber).mockResolvedValue(lifestyle)

      const result = await service.getLifestyle(username, prisonNumber)

      expect(result).toEqual(lifestyle)

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)

      expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(oasysClient.findLifestyle).toHaveBeenCalledWith(prisonNumber)
    })

    describe('when the oasys client throws a 404 error', () => {
      it('returns null', async () => {
        when(oasysClient.findLifestyle).calledWith(prisonNumber).mockRejectedValue(notFoundClientError)

        const result = await service.getLifestyle(username, prisonNumber)
        expect(result).toBeNull()

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findLifestyle).toHaveBeenCalledWith(prisonNumber)
      })
    })

    describe('when the oasys client throws a 500 error', () => {
      it('throws an error', async () => {
        when(oasysClient.findLifestyle).calledWith(prisonNumber).mockRejectedValue(generalClientError)

        const expectedError = createError(500, `Error fetching lifestyle data for prison number ${prisonNumber}.`)
        await expect(service.getLifestyle(username, prisonNumber)).rejects.toThrow(expectedError)

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findLifestyle).toHaveBeenCalledWith(prisonNumber)
      })
    })

    describe('when the oasys client throws an unknown error', () => {
      it('throws a 500 error', async () => {
        when(oasysClient.findLifestyle).calledWith(prisonNumber).mockRejectedValue(unknownError)

        const expectedError = createError(500, `Error fetching lifestyle data for prison number ${prisonNumber}.`)
        await expect(service.getLifestyle(username, prisonNumber)).rejects.toThrow(expectedError)

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findLifestyle).toHaveBeenCalledWith(prisonNumber)
      })
    })
  })

  describe('getOffenceDetails', () => {
    it('returns offence details for given prison number', async () => {
      const offenceDetails = offenceDetailFactory.build()

      when(oasysClient.findOffenceDetails).calledWith(prisonNumber).mockResolvedValue(offenceDetails)

      const result = await service.getOffenceDetails(username, prisonNumber)

      expect(result).toEqual(offenceDetails)

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)

      expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(oasysClient.findOffenceDetails).toHaveBeenCalledWith(prisonNumber)
    })

    describe('when the oasys client throws a 404 error', () => {
      it('returns null', async () => {
        when(oasysClient.findOffenceDetails).calledWith(prisonNumber).mockRejectedValue(notFoundClientError)

        const result = await service.getOffenceDetails(username, prisonNumber)
        expect(result).toBeNull()

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findOffenceDetails).toHaveBeenCalledWith(prisonNumber)
      })
    })

    describe('when the oasys client throws a 500 error', () => {
      it('throws an error', async () => {
        when(oasysClient.findOffenceDetails).calledWith(prisonNumber).mockRejectedValue(generalClientError)

        const expectedError = createError(500, `Error fetching offence details for prison number ${prisonNumber}.`)
        await expect(service.getOffenceDetails(username, prisonNumber)).rejects.toThrow(expectedError)

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findOffenceDetails).toHaveBeenCalledWith(prisonNumber)
      })
    })

    describe('when the oasys client throws an unknown error', () => {
      it('throws a 500 error', async () => {
        when(oasysClient.findOffenceDetails).calledWith(prisonNumber).mockRejectedValue(unknownError)

        const expectedError = createError(500, `Error fetching offence details for prison number ${prisonNumber}.`)
        await expect(service.getOffenceDetails(username, prisonNumber)).rejects.toThrow(expectedError)

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findOffenceDetails).toHaveBeenCalledWith(prisonNumber)
      })
    })
  })

  describe('getPsychiatric', () => {
    it('returns psychiatric information for the given prison number', async () => {
      const psychiatric = psychiatricFactory.build()

      when(oasysClient.findPsychiatric).calledWith(prisonNumber).mockResolvedValue(psychiatric)

      const result = await service.getPsychiatric(username, prisonNumber)

      expect(result).toEqual(psychiatric)

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)

      expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(oasysClient.findPsychiatric).toHaveBeenCalledWith(prisonNumber)
    })

    describe('when the oasys client throws a 404 error', () => {
      it('returns null', async () => {
        when(oasysClient.findPsychiatric).calledWith(prisonNumber).mockRejectedValue(notFoundClientError)

        const result = await service.getPsychiatric(username, prisonNumber)
        expect(result).toBeNull()

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findPsychiatric).toHaveBeenCalledWith(prisonNumber)
      })
    })

    describe('when the oasys client throws a 500 error', () => {
      it('throws an error', async () => {
        when(oasysClient.findPsychiatric).calledWith(prisonNumber).mockRejectedValue(generalClientError)

        const expectedError = createError(500, `Error fetching psychiatric data for prison number ${prisonNumber}.`)
        await expect(service.getPsychiatric(username, prisonNumber)).rejects.toThrow(expectedError)

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findPsychiatric).toHaveBeenCalledWith(prisonNumber)
      })
    })

    describe('when the oasys client throws an unknown error', () => {
      it('throws a 500 error', async () => {
        when(oasysClient.findPsychiatric).calledWith(prisonNumber).mockRejectedValue(unknownError)

        const expectedError = createError(500, `Error fetching psychiatric data for prison number ${prisonNumber}.`)
        await expect(service.getPsychiatric(username, prisonNumber)).rejects.toThrow(expectedError)

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findPsychiatric).toHaveBeenCalledWith(prisonNumber)
      })
    })
  })

  describe('getRelationships', () => {
    it('returns relationships data for given prison number', async () => {
      const relationships = relationshipsFactory.build()

      when(oasysClient.findRelationships).calledWith(prisonNumber).mockResolvedValue(relationships)

      const result = await service.getRelationships(username, prisonNumber)

      expect(result).toEqual(relationships)

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)

      expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(oasysClient.findRelationships).toHaveBeenCalledWith(prisonNumber)
    })

    describe('when the oasys client throws a 404 error', () => {
      it('returns null', async () => {
        when(oasysClient.findRelationships).calledWith(prisonNumber).mockRejectedValue(notFoundClientError)

        const result = await service.getRelationships(username, prisonNumber)
        expect(result).toBeNull()

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findRelationships).toHaveBeenCalledWith(prisonNumber)
      })
    })

    describe('when the oasys client throws a 500 error', () => {
      it('throws an error', async () => {
        when(oasysClient.findRelationships).calledWith(prisonNumber).mockRejectedValue(generalClientError)

        const expectedError = createError(500, `Error fetching relationships for prison number ${prisonNumber}.`)
        await expect(service.getRelationships(username, prisonNumber)).rejects.toThrow(expectedError)

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findRelationships).toHaveBeenCalledWith(prisonNumber)
      })
    })

    describe('when the oasys client throws an unknown error', () => {
      it('throws a 500 error', async () => {
        when(oasysClient.findRelationships).calledWith(prisonNumber).mockRejectedValue(unknownError)

        const expectedError = createError(500, `Error fetching relationships for prison number ${prisonNumber}.`)
        await expect(service.getRelationships(username, prisonNumber)).rejects.toThrow(expectedError)

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findRelationships).toHaveBeenCalledWith(prisonNumber)
      })
    })
  })

  describe('getRisksAndAlerts', () => {
    it('returns the risks and alerts for the given prison number', async () => {
      const risksAndAlerts = risksAndAlertsFactory.build()

      when(oasysClient.findRisksAndAlerts).calledWith(prisonNumber).mockResolvedValue(risksAndAlerts)

      const result = await service.getRisksAndAlerts(username, prisonNumber)

      expect(result).toEqual(risksAndAlerts)

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)

      expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(oasysClient.findRisksAndAlerts).toHaveBeenCalledWith(prisonNumber)
    })

    describe('when the oasys client throws a 404 error', () => {
      it('returns null', async () => {
        when(oasysClient.findRisksAndAlerts).calledWith(prisonNumber).mockRejectedValue(notFoundClientError)

        const result = await service.getRisksAndAlerts(username, prisonNumber)
        expect(result).toBeNull()

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findRisksAndAlerts).toHaveBeenCalledWith(prisonNumber)
      })
    })

    describe('when the oasys client throws a 500 error', () => {
      it('throws an error', async () => {
        when(oasysClient.findRisksAndAlerts).calledWith(prisonNumber).mockRejectedValue(generalClientError)

        const expectedError = createError(500, `Error fetching risks and alerts for prison number ${prisonNumber}.`)
        await expect(service.getRisksAndAlerts(username, prisonNumber)).rejects.toThrow(expectedError)

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findRisksAndAlerts).toHaveBeenCalledWith(prisonNumber)
      })
    })

    describe('when the oasys client throws an unknown error', () => {
      it('throws a 500 error', async () => {
        when(oasysClient.findRisksAndAlerts).calledWith(prisonNumber).mockRejectedValue(unknownError)

        const expectedError = createError(500, `Error fetching risks and alerts for prison number ${prisonNumber}.`)
        await expect(service.getRisksAndAlerts(username, prisonNumber)).rejects.toThrow(expectedError)

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findRisksAndAlerts).toHaveBeenCalledWith(prisonNumber)
      })
    })
  })

  describe('getRoshAnalysis', () => {
    it('returns the RoSH analysis for the given prison number', async () => {
      const roshAnalysis = roshAnalysisFactory.build()

      when(oasysClient.findRoshAnalysis).calledWith(prisonNumber).mockResolvedValue(roshAnalysis)

      const result = await service.getRoshAnalysis(username, prisonNumber)

      expect(result).toEqual(roshAnalysis)

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)

      expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(oasysClient.findRoshAnalysis).toHaveBeenCalledWith(prisonNumber)
    })

    describe('when the oasys client throws a 404 error', () => {
      it('returns null', async () => {
        when(oasysClient.findRoshAnalysis).calledWith(prisonNumber).mockRejectedValue(notFoundClientError)

        const result = await service.getRoshAnalysis(username, prisonNumber)
        expect(result).toBeNull()

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findRoshAnalysis).toHaveBeenCalledWith(prisonNumber)
      })
    })

    describe('when the oasys client throws a 500 error', () => {
      it('throws an error', async () => {
        when(oasysClient.findRoshAnalysis).calledWith(prisonNumber).mockRejectedValue(generalClientError)

        const expectedError = createError(500, `Error fetching RoSH analysis for prison number ${prisonNumber}.`)
        await expect(service.getRoshAnalysis(username, prisonNumber)).rejects.toThrow(expectedError)

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findRoshAnalysis).toHaveBeenCalledWith(prisonNumber)
      })
    })

    describe('when the oasys client throws an unknown error', () => {
      it('throws a 500 error', async () => {
        when(oasysClient.findRoshAnalysis).calledWith(prisonNumber).mockRejectedValue(unknownError)

        const expectedError = createError(500, `Error fetching RoSH analysis for prison number ${prisonNumber}.`)
        await expect(service.getRoshAnalysis(username, prisonNumber)).rejects.toThrow(expectedError)

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findRoshAnalysis).toHaveBeenCalledWith(prisonNumber)
      })
    })
  })
})
