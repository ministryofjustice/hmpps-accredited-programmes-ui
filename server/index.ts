import createApp from './app'
import { controllers } from './controllers'
import { services } from './services'

const app = createApp(controllers(services()), services())

export default app
