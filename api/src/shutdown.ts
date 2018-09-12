/* tslint:disable:no-console */

import * as Koa from 'koa';
import * as http from 'http';
import database from './database';

function createShutdownMiddleware(server: http.Server): Koa.Middleware {
  const forceTimeout = (30 * 1000); // 30s timeout

  let shuttingDown = false;

  async function gracefulExit(signal: string) {
    // We already know we're shutting down, don't continue this function
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;

    console.warn(`Received kill signal ${signal}, shutting down...`);

    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, forceTimeout);

    console.info('Closing database connections...');
    await database.end();

    console.info('Closing server connections...');

    server.close(() => {
      console.info('Closed out remaining connections');
      process.exit(0);
    });
  }

  process.on('SIGINT', () => gracefulExit('SIGINT'));
  process.on('SIGUSR2', () => gracefulExit('SIGUSR2'));
  process.on('SIGTERM', () => gracefulExit('SIGTERM'));

  return async function shutdownMiddleware(ctx, next) {
    if (!shuttingDown) {
      return next();
    }

    ctx.status = 503;
    ctx.set('Connection', 'close');
    ctx.body = 'Server is in the process of restarting';
  };
}

export default createShutdownMiddleware;
