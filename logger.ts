import bunyan from 'bunyan'
import bunyanFormat from 'bunyan-format'

import config from './server/config'

const formatOut = bunyanFormat({ outputMode: 'short', color: !config.production })

const logger =
  process.env.NODE_ENV !== 'test' && !process.env.INTEGRATION_ENV
    ? bunyan.createLogger({ name: 'Accredited Programmes UI', stream: formatOut, level: 'debug' })
    : bunyan.createLogger({ name: 'Accredited Programmes UI', stream: formatOut, level: 'fatal' })

export default logger
