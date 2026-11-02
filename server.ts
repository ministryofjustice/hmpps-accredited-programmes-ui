// Initialise app insights before anything else to allow for instrumentation of bunyan and express
import './server/utils/azureAppInsights'

import logger from './logger'
import { app, metricsApp } from './server/index'

const server = app.listen(app.get('port'), () => {
  logger.info(`Server listening on port ${app.get('port')}`)
})

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${app.get('port')} is already in use`)
  } else {
    logger.error(err, `Error starting server on port ${app.get('port')}`)
  }
  process.exit(1)
})

const metricsServer = metricsApp.listen(metricsApp.get('port'), () => {
  logger.info(`Metrics server listening on port ${metricsApp.get('port')}`)
})

metricsServer.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${metricsApp.get('port')} is already in use`)
  } else {
    logger.error(err, `Error starting metrics server on port ${metricsApp.get('port')}`)
  }
  process.exit(1)
})
