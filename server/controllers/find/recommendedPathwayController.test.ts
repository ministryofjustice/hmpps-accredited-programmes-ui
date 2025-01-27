import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import { when } from 'jest-when'

import RecommendedPathwayController from './recommendedPathwayController'
import { ApplicationRoles } from '../../middleware'
import { findPaths } from '../../paths'
import type { PersonService, PniService } from '../../services'
import { caseloadFactory, personFactory, pniScoreFactory } from '../../testutils/factories'
import { PniUtils } from '../../utils'

jest.mock('../../utils/risksAndNeeds/pniUtils')

const mockPniUtils = PniUtils as jest.Mocked<typeof PniUtils>

describe('RecommendedPathwayController', () => {
  const prisonNumber = 'A1234AA'
  const username = 'USERNAME'
  const caseloads = caseloadFactory.buildList(2)

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const personService = createMock<PersonService>({})
  const pniService = createMock<PniService>({})

  const relationshipsSummaryListRows = [{ key: { text: 'Relationship key' }, value: { text: 'Value' } }]
  const selfManagementSummaryListRows = [{ key: { text: 'Self management key' }, value: { text: 'Value' } }]
  const sexSummaryListRows = [{ key: { text: 'Sex key' }, value: { text: 'Value' } }]
  const thinkingSummaryListRows = [{ key: { text: 'Thinking key' }, value: { text: 'Value' } }]
  const pathwayContent = {
    bodyText: 'Pathway content',
    class: 'pathway-content',
    dataTestId: 'pathway-content',
    headingText: 'High intensity',
  }
  const person = personFactory.build({
    prisonNumber,
  })

  let controller: RecommendedPathwayController

  beforeEach(() => {
    when(personService.getPerson).calledWith(username, prisonNumber).mockResolvedValue(person)

    mockPniUtils.relationshipsSummaryListRows.mockReturnValue(relationshipsSummaryListRows)
    mockPniUtils.selfManagementSummaryListRows.mockReturnValue(selfManagementSummaryListRows)
    mockPniUtils.sexSummaryListRows.mockReturnValue(sexSummaryListRows)
    mockPniUtils.thinkingSummaryListRows.mockReturnValue(thinkingSummaryListRows)
    mockPniUtils.pathwayContent.mockReturnValue(pathwayContent)

    controller = new RecommendedPathwayController(personService, pniService)
    request = createMock<Request>({
      session: {
        pniFindAndReferData: {
          prisonNumber,
        },
      },
    })
    response = createMock<Response>({
      locals: {
        user: {
          caseloads,
          roles: [ApplicationRoles.ACP_REFERRER, ApplicationRoles.ACP_PROGRAMME_TEAM],
          username,
        },
      },
    })
  })

  describe('show', () => {
    it('should render the recommendedPathway template with the correct response locals', async () => {
      const pni = pniScoreFactory.build({
        programmePathway: 'HIGH_INTENSITY_BC',
      })

      when(pniService.getPni).calledWith(username, prisonNumber, { gender: person.gender }).mockResolvedValue(pni)

      await controller.show()(request, response, next)

      expect(PniUtils.pathwayContent).toHaveBeenCalledWith(person.name, pni.programmePathway)
      expect(response.render).toHaveBeenCalledWith('find/recommendedPathway', {
        hasData: true,
        hrefs: {
          back: findPaths.pniFind.personSearch.pattern,
          programmes: findPaths.pniFind.recommenedProgrammes.pattern,
        },
        missingInformation: false,
        notEligible: false,
        pageHeading: `Recommended programme pathway for ${person.name}`,
        pathwayContent,
        relationshipsSummaryListRows,
        selfManagementSummaryListRows,
        sexSummaryListRows,
        thinkingSummaryListRows,
      })
    })

    describe('when the `programmePathway` is `ALTERNATIVE_PATHWAY`', () => {
      it('should render the recommendedPathway template with the correct response locals', async () => {
        const pni = pniScoreFactory.build({
          programmePathway: 'ALTERNATIVE_PATHWAY',
        })

        when(pniService.getPni).calledWith(username, prisonNumber, { gender: person.gender }).mockResolvedValue(pni)

        await controller.show()(request, response, next)

        expect(PniUtils.pathwayContent).toHaveBeenCalledWith(person.name, pni.programmePathway)
        expect(response.render).toHaveBeenCalledWith('find/recommendedPathway', {
          hasData: true,
          hrefs: {
            back: findPaths.pniFind.personSearch.pattern,
            programmes: findPaths.pniFind.recommenedProgrammes.pattern,
          },
          missingInformation: false,
          notEligible: true,
          pageHeading: `Recommended programme pathway for ${person.name}`,
          pathwayContent,
          relationshipsSummaryListRows,
          selfManagementSummaryListRows,
          sexSummaryListRows,
          thinkingSummaryListRows,
        })
      })
    })

    describe('when the `programmePathway` is `MISSING_INFORMATION`', () => {
      it('should render the recommendedPathway template with the correct response locals', async () => {
        const pni = pniScoreFactory.build({
          programmePathway: 'MISSING_INFORMATION',
        })

        when(pniService.getPni).calledWith(username, prisonNumber, { gender: person.gender }).mockResolvedValue(pni)

        await controller.show()(request, response, next)

        expect(PniUtils.pathwayContent).toHaveBeenCalledWith(person.name, 'MISSING_INFORMATION')
        expect(response.render).toHaveBeenCalledWith('find/recommendedPathway', {
          hasData: true,
          hrefs: {
            back: findPaths.pniFind.personSearch.pattern,
            programmes: findPaths.pniFind.recommenedProgrammes.pattern,
          },
          missingInformation: true,
          notEligible: false,
          pageHeading: `Recommended programme pathway for ${person.name}`,
          pathwayContent,
          relationshipsSummaryListRows,
          selfManagementSummaryListRows,
          sexSummaryListRows,
          thinkingSummaryListRows,
        })
      })
    })

    describe('when there is no pni data', () => {
      it('should render the recommendedPathway template with the correct response locals', async () => {
        when(pniService.getPni).calledWith(username, prisonNumber, { gender: person.gender }).mockResolvedValue(null)

        await controller.show()(request, response, next)

        expect(PniUtils.pathwayContent).toHaveBeenCalledWith(person.name, 'MISSING_INFORMATION')
        expect(response.render).toHaveBeenCalledWith('find/recommendedPathway', {
          hasData: false,
          hrefs: {
            back: findPaths.pniFind.personSearch.pattern,
            programmes: findPaths.pniFind.recommenedProgrammes.pattern,
          },
          notEligible: false,
          pageHeading: `Recommended programme pathway for ${person.name}`,
          pathwayContent,
        })
      })
    })

    describe('when there is an error', () => {
      it('should render the recommendedPathway template with the correct response locals', async () => {
        when(pniService.getPni)
          .calledWith(username, prisonNumber, { gender: person.gender })
          .mockRejectedValue(createHttpError(500, 'Error'))

        await controller.show()(request, response, next)

        expect(PniUtils.pathwayContent).toHaveBeenCalledWith(person.name, undefined)
        expect(response.render).toHaveBeenCalledWith('find/recommendedPathway', {
          hasData: false,
          hrefs: {
            back: findPaths.pniFind.personSearch.pattern,
            programmes: findPaths.pniFind.recommenedProgrammes.pattern,
          },
          notEligible: false,
          pageHeading: `Recommended programme pathway for ${person.name}`,
          pathwayContent,
        })
      })
    })

    describe('when there is no prison number in the session', () => {
      it('should redirect to the person search page', async () => {
        delete request.session.pniFindAndReferData?.prisonNumber

        await controller.show()(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(findPaths.pniFind.personSearch.pattern)
      })
    })
  })
})
