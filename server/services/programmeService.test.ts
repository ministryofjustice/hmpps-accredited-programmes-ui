import ProgrammeService from './programmeService'
import ProgrammeClient from '../data/programmeClient'
import { programmeFactory } from '../testutils/factories'

jest.mock('../data/programmeClient')

describe('ProgrammeService', () => {
  const programmeClient = new ProgrammeClient('token') as jest.Mocked<ProgrammeClient>
  const programmeClientFactory = jest.fn()

  const service = new ProgrammeService(programmeClientFactory)

  const token = 'token'

  beforeEach(() => {
    jest.resetAllMocks()
    programmeClientFactory.mockReturnValue(programmeClient)
  })

  describe('getProgrammes', () => {
    it('returns a list of all programmes', async () => {
      const programmes = programmeFactory.buildList(3)
      programmeClient.all.mockResolvedValue(programmes)

      const result = await service.getProgrammes(token)

      expect(result).toEqual(programmes)

      expect(programmeClientFactory).toHaveBeenCalledWith(token)
      expect(programmeClient.all).toHaveBeenCalled()
    })
  })
})
