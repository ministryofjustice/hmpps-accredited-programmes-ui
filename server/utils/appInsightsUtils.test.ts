import type { DataTelemetry, EnvelopeTelemetry } from 'applicationinsights/out/Declarations/Contracts'

import type { ContextObjects } from './appInsightsUtils'
import AppInsightsUtils from './appInsightsUtils'
import type { Caseload } from '@prison-api'

const acpRoles = ['ROLE_ACP_PROGRAMME_TEAM', 'ROLE_ACP_REFERRER']

const user: {
  activeCaseLoadId: string
  caseloads: Array<Caseload>
  roles: Array<string>
  username: string
} = {
  activeCaseLoadId: 'MDI',
  caseloads: [
    {
      caseLoadId: 'MDI',
      caseloadFunction: 'GENERAL',
      currentlyActive: false,
      description: 'Moorland (HMP & YOI)',
      type: 'INST',
    },
    {
      caseLoadId: 'ONI',
      caseloadFunction: 'GENERAL',
      currentlyActive: false,
      description: 'Onley (HMP & YOI)',
      type: 'INST',
    },
  ],
  roles: [...acpRoles, 'ROLE_CREATE_USER', 'ROLE_VIEW_PRISONER_DATA'],
  username: 'TEST_USER',
}

const createEnvelope = (properties: Record<string, boolean | string> | undefined, baseType = 'RequestData') =>
  ({
    data: {
      baseData: { properties },
      baseType,
    } as DataTelemetry,
  }) as EnvelopeTelemetry

const createContext = (
  username?: string,
  activeCaseLoadId?: string,
  roles?: Array<string>,
  caseloads?: Array<Caseload>,
) =>
  ({
    'http.ServerRequest': {
      res: {
        locals: {
          user: {
            activeCaseLoadId,
            caseloads,
            roles,
            username,
          },
        },
      },
    },
  }) as ContextObjects

describe('AppInsightsUtils', () => {
  describe('addUserDataToRequests', () => {
    it('merges username and activeCaseloadId with existing properties when present for sending to ApplicationInsights', () => {
      const contextWithUserDetails = createContext(user.username, user.activeCaseLoadId, user.roles, user.caseloads)
      const envelope = createEnvelope({ other: 'things' })

      AppInsightsUtils.addUserDataToRequests(envelope, contextWithUserDetails)

      expect(envelope.data.baseData!.properties).toEqual({
        acpRoles,
        activeCaseLoadDescription: 'Moorland (HMP & YOI)',
        activeCaseLoadId: user.activeCaseLoadId,
        other: 'things',
        username: user.username,
      })
    })

    it("sets the user fields in the envelope's baseData properties when no other envelope properties have been set", () => {
      const context = createContext(user.username, user.activeCaseLoadId, user.roles, user.caseloads)
      const envelope = createEnvelope(undefined)

      AppInsightsUtils.addUserDataToRequests(envelope, context)

      expect(envelope.data.baseData!.properties).toEqual({
        acpRoles,
        activeCaseLoadDescription: 'Moorland (HMP & YOI)',
        activeCaseLoadId: user.activeCaseLoadId,
        username: user.username,
      })
    })

    it('does not set user data when no username is present on the context object', () => {
      const contextWithoutUsername = createContext(undefined, user.activeCaseLoadId)
      const envelope = createEnvelope({ other: 'things' })

      AppInsightsUtils.addUserDataToRequests(envelope, contextWithoutUsername)

      expect(envelope.data.baseData!.properties).toEqual({ other: 'things' })
    })

    it("does not set user data when the envelope's baseType is not RequestData", () => {
      const context = createContext(user.username, user.activeCaseLoadId)
      const nonRequestTypeEnvelope = createEnvelope({ other: 'things' }, 'NOT_REQUEST_DATA')

      AppInsightsUtils.addUserDataToRequests(nonRequestTypeEnvelope, context)

      expect(nonRequestTypeEnvelope.data.baseData!.properties).toEqual({ other: 'things' })
    })

    it('does not set user data when there is no baseData', () => {
      const context = createContext(user.username, user.activeCaseLoadId)
      const envelopeWithNoBaseData = {
        data: {
          baseType: 'RequestData',
        } as DataTelemetry,
      } as EnvelopeTelemetry

      AppInsightsUtils.addUserDataToRequests(envelopeWithNoBaseData, context)

      expect(envelopeWithNoBaseData.data.baseData).toBeUndefined()
    })

    it('ignores the request when no user data is set on the context object', () => {
      const envelope = createEnvelope({ other: 'things' })

      AppInsightsUtils.addUserDataToRequests(envelope, {
        'http.ServerRequest': {},
      } as ContextObjects)

      expect(envelope.data.baseData!.properties).toEqual({
        other: 'things',
      })
    })
  })
})
