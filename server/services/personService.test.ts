import { createMock } from '@golevelup/ts-jest'
import createError from 'http-errors'

import PersonService from './personService'
import type { RedisClient } from '../data'
import { HmppsAuthClient, PrisonerClient, TokenStore } from '../data'
import { caseloadFactory, personFactory, prisonerFactory } from '../testutils/factories'
import { PersonUtils } from '../utils'

jest.mock('../data/prisonerClient')
jest.mock('../data/hmppsAuthClient')
jest.mock('../utils/personUtils')

const redisClient = createMock<RedisClient>({})
const tokenStore = new TokenStore(redisClient) as jest.Mocked<TokenStore>
const systemToken = 'some system token'
const username = 'USERNAME'

const mdiCaseload = caseloadFactory.active().build({ caseLoadId: 'MDI' })
const bxiCaseload = caseloadFactory.inactive().build({ caseLoadId: 'BXI' })
const caseloads = [mdiCaseload, bxiCaseload]

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

        const result = await service.getPerson(username, prisoner.prisonerNumber, caseloads)

        expect(result).toEqual(person)

        expect(hmppsAuthClientBuilder).toHaveBeenCalled()
        expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)
        expect(prisonerClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(prisonerClient.find).toHaveBeenCalledWith(prisoner.prisonerNumber, [
          mdiCaseload.caseLoadId,
          bxiCaseload.caseLoadId,
        ])
      })
    })

    describe('when the prisoner client does not find a person in prison', () => {
      it('returns `null`', async () => {
        prisonerClient.find.mockResolvedValue(null)

        const notFoundPrisonNumber = 'NOT-FOUND'

        const result = await service.getPerson(username, notFoundPrisonNumber, caseloads)

        expect(result).toEqual(null)

        expect(hmppsAuthClientBuilder).toHaveBeenCalled()
        expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)
        expect(prisonerClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(prisonerClient.find).toHaveBeenCalledWith(notFoundPrisonNumber, [
          mdiCaseload.caseLoadId,
          bxiCaseload.caseLoadId,
        ])
      })
    })

    describe('when the prisoner client throws any other error', () => {
      it('re-throws the error', async () => {
        const clientError = createError(501)
        prisonerClient.find.mockRejectedValue(clientError)

        const prisonNumber = 'ABC123'

        const expectedError = createError(501)

        await expect(() => service.getPerson(username, prisonNumber, caseloads)).rejects.toThrowError(expectedError)

        expect(hmppsAuthClientBuilder).toHaveBeenCalled()
        expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)
        expect(prisonerClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(prisonerClient.find).toHaveBeenCalledWith(prisonNumber, [mdiCaseload.caseLoadId, bxiCaseload.caseLoadId])
      })
    })
  })
})
