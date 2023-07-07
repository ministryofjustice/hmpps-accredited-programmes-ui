import promClient from 'prom-client'

import createApp from './app'
import { controllers } from './controllers'
import { createMetricsApp } from './monitoring/metricsApp'
import { services } from './services'

promClient.collectDefaultMetrics()

const app = createApp(controllers(services), services)
const metricsApp = createMetricsApp()

export { app, metricsApp }
