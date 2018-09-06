import * as Koa from 'koa';
import * as jwtDecode from 'jwt-decode';
import * as auth0 from './auth0';
import database from './database';

export async function getUserById(ctx: Koa.Context) {
  ctx.body = 'Hello, user!';
}

export async function createUser(ctx: Koa.Context) {
  interface RequestBody {
    code?: string,
    redirectUri?: string
  }

  const requestBody = ctx.request.body as RequestBody;

  if (typeof requestBody.code !== 'string') {
    return ctx.throw(422, 'Missing `code` in request body');
  }

  if (typeof requestBody.redirectUri !== 'string') {
    return ctx.throw(422, 'Missing `redirectUri` in request body');
  }

  const tokens = await auth0.getTokens(requestBody.code, requestBody.redirectUri);
  const idToken: auth0.IdToken = jwtDecode(tokens.id_token);
  const queryStr = `
    INSERT INTO
      carabao.user (id)
    VALUES
      ($1)
    ON CONFLICT (id)
      DO NOTHING
    RETURNING *;
  `;

  const results = await database.query(queryStr, [idToken.sub]);
  const newUser = results.rows[0];

  ctx.body = {
    user: newUser,
    tokens: {
      idToken: tokens.id_token,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token
    }
  };
}
