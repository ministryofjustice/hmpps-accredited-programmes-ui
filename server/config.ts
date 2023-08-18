const production = process.env.NODE_ENV === 'production'

function get<T>(name: string, fallback: T, options = { requireInProduction: false }): T | string {
  if (process.env[name]) {
    return process.env[name] as string
  }
  if (fallback !== undefined && (!production || !options.requireInProduction)) {
    return fallback
  }
  throw new Error(`Missing env var ${name}`)
}

const requiredInProduction = { requireInProduction: true }

export class AgentConfig {
  timeout: number

  constructor(timeout = 8000) {
    this.timeout = timeout
  }
}

export interface ApiConfig {
  agent: AgentConfig
  timeout: {
    deadline: number
    response: number
  }
  url: string
}

export default {
  apis: {
    accreditedProgrammesApi: {
      agent: new AgentConfig(Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000))),
      timeout: {
        deadline: Number(get('ACCREDITED_PROGRAMMES_API_TIMEOUT_DEADLINE', 10000)),
        response: Number(get('ACCREDITED_PROGRAMMES_API_TIMEOUT_RESPONSE', 10000)),
      },
      url: get('ACCREDITED_PROGRAMMES_API_URL', 'http://localhost:9091', requiredInProduction),
    },
    hmppsAuth: {
      agent: new AgentConfig(Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000))),
      apiClientId: get('API_CLIENT_ID', 'clientid', requiredInProduction),
      apiClientSecret: get('API_CLIENT_SECRET', 'clientsecret', requiredInProduction),
      externalUrl: get('HMPPS_AUTH_EXTERNAL_URL', get('HMPPS_AUTH_URL', 'http://localhost:9090/auth')),
      systemClientId: get('SYSTEM_CLIENT_ID', 'clientid', requiredInProduction),
      systemClientSecret: get('SYSTEM_CLIENT_SECRET', 'clientsecret', requiredInProduction),
      timeout: {
        deadline: Number(get('HMPPS_AUTH_TIMEOUT_DEADLINE', 10000)),
        response: Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000)),
      },
      url: get('HMPPS_AUTH_URL', 'http://localhost:9090/auth', requiredInProduction),
    },
    prisonRegisterApi: {
      agent: new AgentConfig(Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000))),
      timeout: {
        deadline: Number(get('PRISON_REGISTER_API_TIMEOUT_DEADLINE', 10000)),
        response: Number(get('PRISON_REGISTER_API_TIMEOUT_RESPONSE', 10000)),
      },
      url: get('PRISON_REGISTER_API_URL', 'http://localhost:9092', requiredInProduction),
    },
    prisonerOffenderSearch: {
      agent: new AgentConfig(Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000))),
      timeout: {
        deadline: Number(get('PRISONER_OFFENDER_SEARCH_TIMEOUT_DEADLINE', 10000)),
        response: Number(get('PRISONER_OFFENDER_SEARCH_TIMEOUT_RESPONSE', 10000)),
      },
      url: get('PRISONER_OFFENDER_SEARCH_URL', 'http://localhost:9093', requiredInProduction),
    },
    tokenVerification: {
      agent: new AgentConfig(Number(get('TOKEN_VERIFICATION_API_TIMEOUT_RESPONSE', 5000))),
      enabled: get('TOKEN_VERIFICATION_ENABLED', 'false') === 'true',
      timeout: {
        deadline: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_DEADLINE', 5000)),
        response: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_RESPONSE', 5000)),
      },
      url: get('TOKEN_VERIFICATION_API_URL', 'http://localhost:8100', requiredInProduction),
    },
  },
  domain: get('INGRESS_URL', 'http://localhost:3000', requiredInProduction),
  enableApplicationInsights: production,
  environment: process.env.ENVIRONMENT || 'local',
  flags: {
    referEnabled: get('REFER_ENABLED', 'false') === 'true',
  },
  https: production,
  production,
  redis: {
    host: get('REDIS_HOST', 'localhost', requiredInProduction),
    password: process.env.REDIS_AUTH_TOKEN,
    port: Number(process.env.REDIS_PORT) || 6379,
    tls_enabled: get('REDIS_TLS_ENABLED', 'false'),
  },
  sentry: {
    dsn: get('SENTRY_DSN', null, requiredInProduction),
  },
  session: {
    expiryMinutes: Number(get('WEB_SESSION_TIMEOUT_IN_MINUTES', 120)),
    secret: get('SESSION_SECRET', 'app-insecure-default-session', requiredInProduction),
  },
  staticResourceCacheDuration: 20,
}
