import AppInsightsUtils from './appInsightsUtils'
import type { Caseload } from '@prison-api'

const caseloads: Array<Caseload> = [
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
]

describe('AppInsightsUtils', () => {
  describe('getUserAttributes', () => {
    it('returns the username, active caseload and ACP roles of the user for sending to ApplicationInsights', () => {
      expect(
        AppInsightsUtils.getUserAttributes({
          activeCaseLoadId: 'MDI',
          caseloads,
          roles: ['ROLE_ACP_PROGRAMME_TEAM', 'ROLE_ACP_REFERRER', 'ROLE_CREATE_USER', 'ROLE_VIEW_PRISONER_DATA'],
          username: 'TEST_USER',
        }),
      ).toEqual({
        acpRoles: 'ROLE_ACP_PROGRAMME_TEAM,ROLE_ACP_REFERRER',
        activeCaseLoadDescription: 'Moorland (HMP & YOI)',
        activeCaseLoadId: 'MDI',
        username: 'TEST_USER',
      })
    })

    it('returns an empty acpRoles value when the user has no ACP roles', () => {
      expect(AppInsightsUtils.getUserAttributes({ roles: ['ROLE_CREATE_USER'], username: 'TEST_USER' })).toEqual(
        expect.objectContaining({ acpRoles: '' }),
      )
    })

    it('returns no activeCaseLoadDescription when the active caseload is not in the caseloads of the user', () => {
      expect(AppInsightsUtils.getUserAttributes({ activeCaseLoadId: 'BXI', caseloads, username: 'TEST_USER' })).toEqual(
        expect.objectContaining({ activeCaseLoadDescription: undefined, activeCaseLoadId: 'BXI' }),
      )
    })

    it('returns undefined values when there is no user', () => {
      expect(AppInsightsUtils.getUserAttributes(undefined)).toEqual({
        acpRoles: undefined,
        activeCaseLoadDescription: undefined,
        activeCaseLoadId: undefined,
        username: undefined,
      })
    })
  })
})
