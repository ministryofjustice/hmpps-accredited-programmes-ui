import promClient from 'prom-client'

import createApp from './app'
import { createMetricsApp } from './monitoring/metricsApp'

promClient.collectDefaultMetrics()

const app = createApp()
const metricsApp = createMetricsApp()

export { app, metricsApp }
