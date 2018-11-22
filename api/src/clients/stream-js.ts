import * as stream from 'getstream'
import * as config from '../config'

const client = stream.connect(
  config.streamJsApiKey,
  config.streamJsApiSecret,
  config.streamJsAppId,
  {
    location: 'us-east'
  }
)

export default client
