import assert from 'assert'
import bunyan from 'bunyan'
import bunyanFormat from 'bunyan-format'

import config from './server/config'

const validLogLevels: Array<bunyan.LogLevelString> = ['trace', 'debug', 'info', 'warn', 'error', 'fatal']

const getLogLevel = (): bunyan.LogLevelString => {
  if (process.env.NODE_ENV === 'test' || process.env.INTEGRATION_ENV) {
    return 'fatal'
  }

  const logLevel = process.env.LOG_LEVEL?.toLowerCase().trim() || 'info'
  assert(
    validLogLevels.includes(logLevel as bunyan.LogLevelString),
    `Invalid log level: '${logLevel}', valid options: '${validLogLevels}'`,
  )

  return logLevel as bunyan.LogLevelString
}

const formatOut = bunyanFormat({ color: !config.production, outputMode: 'short' })

const logger = bunyan.createLogger({ level: getLogLevel(), name: 'Accredited Programmes UI', stream: formatOut })

export default logger
