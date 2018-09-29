import * as config from './config'
import server from './server'

server.listen(config.port)

// tslint:disable-next-line:no-console
console.info(`App is now listening in port ${config.port}`)
