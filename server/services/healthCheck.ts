import promClient from 'prom-client'

import type { AgentConfig } from '../config'
import config from '../config'
import { serviceCheckFactory } from '../data'

const healthCheckGauge = new promClient.Gauge({
  help: 'health of an upstream dependency - 1 = healthy, 0 = not healthy',
  labelNames: ['service'],
  name: 'upstream_healthcheck',
})

interface HealthCheckStatus {
  message: unknown
  name: string
  status: string
}

interface HealthCheckResult extends Record<string, unknown> {
  checks: Record<string, unknown>
  healthy: boolean
}

type HealthCheckCallback = (result: HealthCheckResult) => void
type HealthCheckService = () => Promise<HealthCheckStatus>

function service(name: string, url: string, agentConfig: AgentConfig): HealthCheckService {
  const check = serviceCheckFactory(name, url, agentConfig)
  return () =>
    check()
      .then(result => ({ message: result, name, status: 'ok' }))
      .catch(err => ({ message: err, name, status: 'ERROR' }))
}

function addAppInfo(result: HealthCheckResult): HealthCheckResult {
  const buildInformation = getBuild()
  const buildInfo = {
    build: buildInformation,
    uptime: process.uptime(),
    version: buildInformation && buildInformation.buildNumber,
  }

  return { ...result, ...buildInfo }
}

function getBuild() {
  try {
    // eslint-disable-next-line import/no-unresolved, global-require
    return require('../../build-info.json')
  } catch (ex) {
    return null
  }
}

function gatherCheckInfo(aggregateStatus: Record<string, unknown>, currentStatus: HealthCheckStatus) {
  return { ...aggregateStatus, [currentStatus.name]: currentStatus.message }
}

const apiChecks = [
  service('hmppsAuth', `${config.apis.hmppsAuth.url}/health/ping`, config.apis.hmppsAuth.agent),
  ...(config.apis.tokenVerification.enabled
    ? [
        service(
          'tokenVerification',
          `${config.apis.tokenVerification.url}/health/ping`,
          config.apis.tokenVerification.agent,
        ),
      ]
    : []),
]

export default function healthCheck(callback: HealthCheckCallback, checks = apiChecks): void {
  Promise.all(checks.map(fn => fn())).then(checkResults => {
    const allOk = checkResults.every(item => item.status === 'ok')

    const result = {
      checks: checkResults.reduce(gatherCheckInfo, {}),
      healthy: allOk,
    }

    checkResults.forEach(item => {
      const val = item.status === 'ok' ? 1 : 0
      healthCheckGauge.labels(item.name).set(val)
    })

    callback(addAppInfo(result))
  })
}

export type { HealthCheckCallback, HealthCheckService }
