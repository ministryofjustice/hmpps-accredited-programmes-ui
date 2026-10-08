/* istanbul ignore file */

/*
 * This must be imported before any other modules, as OpenTelemetry needs to
 * instrument express, http and bunyan before they are loaded
 */
import { flushTelemetry, initialiseTelemetry, telemetry } from '@ministryofjustice/hmpps-azure-telemetry'

import { buildNumber, packageData } from '../applicationVersion'

initialiseTelemetry({
  connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
  debug: process.env.DEBUG_TELEMETRY === 'true',
  serviceName: packageData.name,
  serviceVersion: buildNumber,
})
  .addFilter(telemetry.processors.filterSpanWherePath(['/health', '/ping', '/metrics', '/assets/*', '/favicon.ico']))
  .addModifier(telemetry.processors.enrichSpanNameWithHttpRoute())
  .startRecording()

const shutdown = async () => {
  await flushTelemetry()
  process.exit(0)
}

process.on('SIGTERM', () => shutdown())
process.on('SIGINT', () => shutdown())
