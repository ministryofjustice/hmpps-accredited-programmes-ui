import promClient from 'prom-client'
import { createMetricsApp } from './monitoring/metricsApp'
import createApp from './app'
import { services } from './services'
import { controllers } from './controllers'

promClient.collectDefaultMetrics()

const app = createApp(controllers(services()), services())
const metricsApp = createMetricsApp()

export { app, metricsApp }
