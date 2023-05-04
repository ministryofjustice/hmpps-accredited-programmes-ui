import { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import ProgrammesController from './programmesController'
import { programmeFactory } from '../../testutils/factories'
import { ProgrammeService } from '../../services'
import { programmeListItems } from '../../utils/programmeUtils'

describe('ProgrammesController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const programmeService = createMock<ProgrammeService>({})

  let programmesController: ProgrammesController

  beforeEach(() => {
    programmesController = new ProgrammesController(programmeService)
  })

  describe('index', () => {
    it('should render the programmes index template', async () => {
      const programmes = programmeFactory.buildList(3)
      programmeService.getProgrammes.mockResolvedValue(programmes)

      const requestHandler = programmesController.index()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('programmes/index', {
        pageHeading: 'List of accredited programmes',
        programmeListItems: programmeListItems(programmes),
      })

      expect(programmeService.getProgrammes).toHaveBeenCalledWith('token')
    })
  })
})
