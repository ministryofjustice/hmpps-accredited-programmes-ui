import createError from 'http-errors'

import PersonService from './personService'
import { PrisonerClient } from '../data'
import { personFactory, prisonerFactory } from '../testutils/factories'
import { PersonUtils } from '../utils'

jest.mock('../data/prisonerClient')
jest.mock('../utils/personUtils')

describe('PersonService', () => {
  const prisonerClient = new PrisonerClient('token') as jest.Mocked<PrisonerClient>
  const prisonerClientBuilder = jest.fn()

  const service = new PersonService(prisonerClientBuilder)

  const token = 'token'

  beforeEach(() => {
    jest.resetAllMocks()
    prisonerClientBuilder.mockReturnValue(prisonerClient)
  })

  describe('getPerson', () => {
    describe('when the prisoner client finds the corresponding prisoner', () => {
      it('converts the returned object to a Person', async () => {
        const prisoner = prisonerFactory.build()

        const person = personFactory.build()

        prisonerClient.getPrisoner.mockResolvedValue(prisoner)
        ;(PersonUtils.personFromPrisoner as jest.Mock).mockReturnValue(person)

        const result = await service.getPerson(token, prisoner.prisonerNumber)

        expect(result).toEqual(person)

        expect(prisonerClientBuilder).toHaveBeenCalledWith(token)
        expect(prisonerClient.getPrisoner).toHaveBeenCalledWith(prisoner.prisonerNumber)
      })
    })

    describe('when the prisoner client throws a 404 error', () => {
      it('returns `null`', async () => {
        const clientError = createError(404)
        prisonerClient.getPrisoner.mockRejectedValue(clientError)

        const notFoundPrisonNumber = 'NOT-FOUND'

        const result = await service.getPerson(token, notFoundPrisonNumber)

        expect(result).toEqual(null)

        expect(prisonerClientBuilder).toHaveBeenCalledWith(token)
        expect(prisonerClient.getPrisoner).toHaveBeenCalledWith(notFoundPrisonNumber)
      })
    })

    describe('when the prisoner client throws any other error', () => {
      it('re-throws the error', async () => {
        const clientError = createError(501)
        prisonerClient.getPrisoner.mockRejectedValue(clientError)

        const prisonNumber = 'ABC123'

        const expectedError = createError(501)

        expect(() => service.getPerson(token, prisonNumber)).rejects.toThrowError(expectedError)

        expect(prisonerClientBuilder).toHaveBeenCalledWith(token)
        expect(prisonerClient.getPrisoner).toHaveBeenCalledWith(prisonNumber)
      })
    })
  })
})
