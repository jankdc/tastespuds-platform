import * as Koa from 'koa';
import * as jwtDecode from 'jwt-decode';
import * as auth0 from './auth0';
import database from './database';

export async function createUser(ctx: Koa.Context) {
  interface RequestBody {
    code?: string,
    redirectUri?: string
  }

  const { code, redirectUri } = ctx.request.body as RequestBody;

  if (typeof code !== 'string') {
    return ctx.throw(422, 'Missing `code` in request body');
  }

  if (typeof redirectUri !== 'string') {
    return ctx.throw(422, 'Missing `redirectUri` in request body');
  }

  const tokens = await auth0.getTokens(code, redirectUri);
  const idToken: auth0.IdToken = jwtDecode(tokens.id_token);
  const queryStr = `
    INSERT INTO
      tastespuds.user (id)
    VALUES
      ($1)
    ON CONFLICT (id)
      DO UPDATE SET id = EXCLUDED.id
    RETURNING *;
  `;

  const results = await database.query(queryStr, [idToken.sub]);
  const newUser = results.rows[0];

  ctx.body = {
    user: newUser,
    tokens: {
      idToken: tokens.id_token,
      expiresIn: tokens.expires_in,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token
    }
  };
}
