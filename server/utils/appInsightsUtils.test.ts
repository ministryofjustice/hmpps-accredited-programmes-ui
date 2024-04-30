import type { DataTelemetry, EnvelopeTelemetry } from 'applicationinsights/out/Declarations/Contracts'

import type { ContextObjects } from './appInsightsUtils'
import AppInsightsUtils from './appInsightsUtils'

const user = {
  activeCaseLoadId: 'MDI',
  caseloadDescription: 'Moorland (HMP & YOI)',
  username: 'TEST_USER',
}

const createEnvelope = (properties: Record<string, boolean | string> | undefined, baseType = 'RequestData') =>
  ({
    data: {
      baseData: { properties },
      baseType,
    } as DataTelemetry,
  }) as EnvelopeTelemetry

const createContext = (username?: string, activeCaseLoadId?: string, caseloadDescription?: string) =>
  ({
    'http.ServerRequest': {
      res: {
        locals: {
          user: {
            activeCaseLoadId,
            caseloadDescription,
            username,
          },
        },
      },
    },
  }) as ContextObjects

describe('AppInsightsUtils', () => {
  describe('addUserDataToRequests', () => {
    it('merges username, caseloadDescription and activeCaseloadId with existing properties when present for sending to ApplicationInsights', () => {
      const contextWithUserDetails = createContext(user.username, user.activeCaseLoadId, user.caseloadDescription)
      const envelope = createEnvelope({ other: 'things' })

      AppInsightsUtils.addUserDataToRequests(envelope, contextWithUserDetails)

      expect(envelope.data.baseData!.properties).toEqual({
        activeCaseLoadId: user.activeCaseLoadId,
        caseloadDescription: user.caseloadDescription,
        other: 'things',
        username: user.username,
      })
    })

    it("sets the user fields in the envelope's baseData properties when no other envelope properties have been set", () => {
      const context = createContext(user.username, user.activeCaseLoadId, user.caseloadDescription)
      const envelope = createEnvelope(undefined)

      AppInsightsUtils.addUserDataToRequests(envelope, context)

      expect(envelope.data.baseData!.properties).toEqual(user)
    })

    it('does not set user data when no username is present on the context object', () => {
      const contextWithoutUsername = createContext(undefined, user.activeCaseLoadId, user.caseloadDescription)
      const envelope = createEnvelope({ other: 'things' })

      AppInsightsUtils.addUserDataToRequests(envelope, contextWithoutUsername)

      expect(envelope.data.baseData!.properties).toEqual({ other: 'things' })
    })

    it("does not set user data when the envelope's baseType is not RequestData", () => {
      const context = createContext(user.username, user.activeCaseLoadId, user.caseloadDescription)
      const nonRequestTypeEnvelope = createEnvelope({ other: 'things' }, 'NOT_REQUEST_DATA')

      AppInsightsUtils.addUserDataToRequests(nonRequestTypeEnvelope, context)

      expect(nonRequestTypeEnvelope.data.baseData!.properties).toEqual({ other: 'things' })
    })

    it('does not set user data when there is no baseData', () => {
      const context = createContext(user.username, user.activeCaseLoadId, user.caseloadDescription)
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
