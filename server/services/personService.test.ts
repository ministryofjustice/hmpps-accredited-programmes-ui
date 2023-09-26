import { createMock } from '@golevelup/ts-jest'
import createError from 'http-errors'

import PersonService from './personService'
import type { RedisClient } from '../data'
import { HmppsAuthClient, PrisonerClient, TokenStore } from '../data'
import { personFactory, prisonerFactory } from '../testutils/factories'
import { PersonUtils } from '../utils'

jest.mock('../data/prisonerClient')
jest.mock('../data/hmppsAuthClient')
jest.mock('../utils/personUtils')

const redisClient = createMock<RedisClient>({})
const tokenStore = new TokenStore(redisClient) as jest.Mocked<TokenStore>
const systemToken = 'some system token'
const username = 'USERNAME'

describe('PersonService', () => {
  const prisonerClient = new PrisonerClient(systemToken) as jest.Mocked<PrisonerClient>
  const prisonerClientBuilder = jest.fn()

  const hmppsAuthClient = new HmppsAuthClient(tokenStore) as jest.Mocked<HmppsAuthClient>
  const hmppsAuthClientBuilder = jest.fn()

  let service: PersonService

  beforeEach(() => {
    jest.resetAllMocks()

    prisonerClientBuilder.mockReturnValue(prisonerClient)
    hmppsAuthClientBuilder.mockReturnValue(hmppsAuthClient)
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(systemToken)

    service = new PersonService(hmppsAuthClientBuilder, prisonerClientBuilder)
  })

  describe('getPerson', () => {
    describe('when the prisoner client finds the corresponding prisoner', () => {
      it('converts the returned object to a Person', async () => {
        const prisoner = prisonerFactory.build()

        const person = personFactory.build()

        prisonerClient.find.mockResolvedValue(prisoner)
        ;(PersonUtils.personFromPrisoner as jest.Mock).mockReturnValue(person)

        const result = await service.getPerson(username, prisoner.prisonerNumber)

        expect(result).toEqual(person)

        expect(hmppsAuthClientBuilder).toHaveBeenCalled()
        expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)
        expect(prisonerClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(prisonerClient.find).toHaveBeenCalledWith(prisoner.prisonerNumber)
      })
    })

    describe('when the prisoner client throws a 404 error', () => {
      it('returns `null`', async () => {
        const clientError = createError(404)
        prisonerClient.find.mockRejectedValue(clientError)

        const notFoundPrisonNumber = 'NOT-FOUND'

        const result = await service.getPerson(username, notFoundPrisonNumber)

        expect(result).toEqual(null)

        expect(hmppsAuthClientBuilder).toHaveBeenCalled()
        expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)
        expect(prisonerClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(prisonerClient.find).toHaveBeenCalledWith(notFoundPrisonNumber)
      })
    })

    describe('when the prisoner client throws any other error', () => {
      it('re-throws the error', async () => {
        const clientError = createError(501)
        prisonerClient.find.mockRejectedValue(clientError)

        const prisonNumber = 'ABC123'

        const expectedError = createError(501)

        await expect(() => service.getPerson(username, prisonNumber)).rejects.toThrowError(expectedError)

        expect(hmppsAuthClientBuilder).toHaveBeenCalled()
        expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)
        expect(prisonerClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(prisonerClient.find).toHaveBeenCalledWith(prisonNumber)
      })
    })
  })
})
