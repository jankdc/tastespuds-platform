import 'jest';
import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';
import * as request from 'supertest';

async function readFixture(relativePath) {
  const fixture = await util.promisify(fs.readFile)(path.resolve(__dirname, relativePath));
  return fixture.toString();
}

beforeAll(async () => {
  // mock environment
  const env = require('env-var');
  const envFixture  = await readFixture('../__fixtures__/env.json');
  const mockEnv = env.mock(JSON.parse(envFixture));
  const getEnvMock = jest.spyOn(env, 'get');
  getEnvMock.mockImplementation(mockEnv.get);

  // mock auth0 call
  const auth0 = require('../src/auth0');
  const tokensFixture = await readFixture('../__fixtures__/tokens.json');
  const getTokensMock = jest.spyOn(auth0, 'getTokens');
  getTokensMock.mockImplementation(async () => JSON.parse(tokensFixture));
});

test('create a new user', async () => {
  const server = require('../src/server').default;

  const response = await request(server)
    .post('/users')
    .set('Accept', 'application/json')
    .send({code: 'some-code', redirectUri: 'some-uri'})
    .expect(200)
    .expect('Content-Type', /json/);

  expect(response.body).toMatchSnapshot();
});

test('respond with the same user if created twice', async () => {
  const server = require('../src/server').default;

  await request(server)
    .post('/users')
    .set('Accept', 'application/json')
    .send({code: 'some-code', redirectUri: 'some-uri'})
    .expect(200)
    .expect('Content-Type', /json/);

  const response = await request(server)
    .post('/users')
    .set('Accept', 'application/json')
    .send({code: 'some-code', redirectUri: 'some-uri'})
    .expect(200)
    .expect('Content-Type', /json/);

  expect(response.body).toMatchSnapshot();
});

test('respond with a 422 if `redirectUri` is missing', async () => {
  const server = require('../src/server').default;

  const response = await request(server)
    .post('/users')
    .set('Accept', 'application/json')
    .send({code: 'some-code'})
    .expect(422)
    .expect('Content-Type', /json/);

  expect(response.body).toMatchSnapshot();
});

test('respond with a 422 if `code` is missing', async () => {
  const server = require('../src/server').default;

  const response = await request(server)
    .post('/users')
    .set('Accept', 'application/json')
    .send({redirectUri: 'some-uri'})
    .expect(422)
    .expect('Content-Type', /json/);

  expect(response.body).toMatchSnapshot();
});

afterEach(async () => {
  const database = require('../src/database').default;
  const file: string = await readFixture('../__fixtures__/tables.json');
  const json: Array<string> = JSON.parse(file);

  await database.query(`TRUNCATE ${json.join(',')} RESTART IDENTITY CASCADE`);
});

afterAll(async () => {
  const database = require('../src/database').default;
  await database.end();
});
