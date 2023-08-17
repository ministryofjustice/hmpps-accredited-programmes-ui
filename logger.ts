import bunyan from 'bunyan'
import bunyanFormat from 'bunyan-format'

import config from './server/config'

const formatOut = bunyanFormat({ color: !config.production, outputMode: 'short' })

const logger =
  process.env.NODE_ENV !== 'test' && !process.env.INTEGRATION_ENV
    ? bunyan.createLogger({ level: 'debug', name: 'Accredited Programmes UI', stream: formatOut })
    : bunyan.createLogger({ level: 'fatal', name: 'Accredited Programmes UI', stream: formatOut })

export default logger
