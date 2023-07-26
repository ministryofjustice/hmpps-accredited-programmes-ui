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
  url: string
  timeout: {
    response: number
    deadline: number
  }
  agent: AgentConfig
}

export default {
  production,
  https: production,
  staticResourceCacheDuration: 20,
  environment: process.env.ENVIRONMENT || 'local',
  redis: {
    host: get('REDIS_HOST', 'localhost', requiredInProduction),
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_AUTH_TOKEN,
    tls_enabled: get('REDIS_TLS_ENABLED', 'false'),
  },
  sentry: {
    dsn: get('SENTRY_DSN', null, requiredInProduction),
  },
  session: {
    secret: get('SESSION_SECRET', 'app-insecure-default-session', requiredInProduction),
    expiryMinutes: Number(get('WEB_SESSION_TIMEOUT_IN_MINUTES', 120)),
  },
  apis: {
    hmppsAuth: {
      url: get('HMPPS_AUTH_URL', 'http://localhost:9090/auth', requiredInProduction),
      externalUrl: get('HMPPS_AUTH_EXTERNAL_URL', get('HMPPS_AUTH_URL', 'http://localhost:9090/auth')),
      timeout: {
        response: Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('HMPPS_AUTH_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000))),
      apiClientId: get('API_CLIENT_ID', 'clientid', requiredInProduction),
      apiClientSecret: get('API_CLIENT_SECRET', 'clientsecret', requiredInProduction),
      systemClientId: get('SYSTEM_CLIENT_ID', 'clientid', requiredInProduction),
      systemClientSecret: get('SYSTEM_CLIENT_SECRET', 'clientsecret', requiredInProduction),
    },
    accreditedProgrammesApi: {
      url: get('ACCREDITED_PROGRAMMES_API_URL', 'http://localhost:9091', requiredInProduction),
      timeout: {
        response: Number(get('ACCREDITED_PROGRAMMES_API_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('ACCREDITED_PROGRAMMES_API_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000))),
    },
    prisonRegisterApi: {
      url: get('PRISON_REGISTER_API_URL', 'http://localhost:9092', requiredInProduction),
      timeout: {
        response: Number(get('PRISON_REGISTER_API_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('PRISON_REGISTER_API_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000))),
    },
    prisonerSearch: {
      url: get('PRISONER_SEARCH_ENDPOINT_URL', 'http://localhost:8084', requiredInProduction),
      timeout: {
        response: get('PRISONER_SEARCH_ENDPOINT_TIMEOUT_RESPONSE', 10000),
        deadline: get('PRISONER_SEARCH_ENDPOINT_TIMEOUT_DEADLINE', 10000),
      },
      agent: {
        maxSockets: 100,
        maxFreeSockets: 10,
        freeSocketTimeout: 30000,
      },
    },
    tokenVerification: {
      url: get('TOKEN_VERIFICATION_API_URL', 'http://localhost:8100', requiredInProduction),
      timeout: {
        response: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_RESPONSE', 5000)),
        deadline: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_DEADLINE', 5000)),
      },
      agent: new AgentConfig(Number(get('TOKEN_VERIFICATION_API_TIMEOUT_RESPONSE', 5000))),
      enabled: get('TOKEN_VERIFICATION_ENABLED', 'false') === 'true',
    },
  },
  domain: get('INGRESS_URL', 'http://localhost:3000', requiredInProduction),
}
