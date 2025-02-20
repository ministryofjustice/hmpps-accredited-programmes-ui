import nock from 'nock'

import PersonClient from './personClient'
import config from '../../config'
import { apiPaths } from '../../paths'
import { peopleSearchResponseFactory, sentenceDetailsFactory } from '../../testutils/factories'

describe('PersonClient', () => {
  let fakeAccreditedProgrammesApi: nock.Scope
  let personClient: PersonClient

  const systemToken = 'token-1'

  beforeEach(() => {
    fakeAccreditedProgrammesApi = nock(config.apis.accreditedProgrammesApi.url)
    personClient = new PersonClient(systemToken)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('findPrisoner', () => {
    const prisoner = peopleSearchResponseFactory.build()

    it('searches for a prisoner by prison number and caseload IDs and returns the first match on the assumption that there will never be multiple matches', async () => {
      fakeAccreditedProgrammesApi
        .post(apiPaths.person.prisonerSearch({}))
        .matchHeader('authorization', `Bearer ${systemToken}`)
        .reply(200, [prisoner])

      const output = await personClient.findPrisoner(prisoner.prisonerNumber, ['BXI', 'MDI'])
      expect(output).toEqual(prisoner)
    })

    describe('when no prisoner is found', () => {
      it('returns null', async () => {
        fakeAccreditedProgrammesApi
          .post(apiPaths.person.prisonerSearch({}))
          .matchHeader('authorization', `Bearer ${systemToken}`)
          .reply(200, [])

        const output = await personClient.findPrisoner(prisoner.prisonerNumber, ['BXI', 'MDI'])
        expect(output).toEqual(null)
      })
    })
  })

  describe('findSentenceDetails', () => {
    it('returns the sentence details for a prisoner', async () => {
      const prisonerNumber = 'A1234AA'
      const sentenceDetails = sentenceDetailsFactory.build()

      fakeAccreditedProgrammesApi
        .get(apiPaths.person.prisonerSentences({ prisonNumber: prisonerNumber }))
        .matchHeader('authorization', `Bearer ${systemToken}`)
        .reply(200, sentenceDetails)

      const output = await personClient.findSentenceDetails(prisonerNumber)
      expect(output).toEqual(sentenceDetails)
    })
  })
})
