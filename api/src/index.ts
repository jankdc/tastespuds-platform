import * as env from 'env-var';
import server from './server';

const port = env.get('PORT').required().asIntPositive();
server.listen(port);

// tslint:disable-next-line:no-console
console.info(`App is now listening in port ${port}`);
