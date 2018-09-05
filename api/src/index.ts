import * as env from 'env-var';
import server from './server';

const port = env.get('PORT').required().asIntPositive();
server.listen(port);
console.info(`App is now listening in port ${port}`);
