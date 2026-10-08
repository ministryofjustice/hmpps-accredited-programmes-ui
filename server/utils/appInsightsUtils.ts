import type { UserDetails } from '@accredited-programmes/users'

type TelemetryUser = Partial<UserDetails> & {
  roles?: Array<string>
}

export default class AppInsightsUtils {
  // userId and userUuid are added to the telemetry by default from res.locals.user, so are not included here
  static getUserAttributes(user: TelemetryUser | undefined): Record<string, string | undefined> {
    const { activeCaseLoadId, caseloads, roles, username } = user || {}

    return {
      acpRoles: roles?.filter(role => role.startsWith('ROLE_ACP_')).join(','),
      activeCaseLoadDescription: caseloads?.find(caseload => caseload.caseLoadId === activeCaseLoadId)?.description,
      activeCaseLoadId,
      username,
    }
  }
}
