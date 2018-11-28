import 'jest'
import * as fs from 'fs'
import * as util from 'util'
import * as path from 'path'
import * as request from 'supertest'

async function readFixture(relativePath: string) {
  const fixture = await util.promisify(fs.readFile)(path.resolve(__dirname, relativePath))
  return fixture.toString()
}

beforeAll(async () => {
  // mock environment
  const env = require('env-var')
  const envFixture  = await readFixture('../__fixtures__/env.json')
  const mockEnv = env.mock(JSON.parse(envFixture))
  const getEnvMock = jest.spyOn(env, 'get')
  getEnvMock.mockImplementation(mockEnv.get)

  // mock auth0 call
  const auth0 = require('../src/clients/auth0')
  const tokensFixture = await readFixture('../__fixtures__/tokens.json')
  const auth9UserMock = jest.spyOn(auth0, 'authenticateUserFromOauth')
  auth9UserMock.mockImplementation(async () => JSON.parse(tokensFixture))
})

test('login a new user', async () => {
  const server = require('../src/server').default

  const response = await request(server)
    .post('/oauth/login')
    .set('Accept', 'application/json')
    .send({code: 'some-code', email: 'tastespuds@gmail.com'})
    .expect(200)
    .expect('Content-Type', /json/)

  expect(response.body).toMatchSnapshot()
})

test('respond with the same user if logged in twice', async () => {
  const server = require('../src/server').default

  await request(server)
    .post('/oauth/login')
    .set('Accept', 'application/json')
    .send({code: 'some-code', email: 'tastespuds@gmail.com'})
    .expect(200)
    .expect('Content-Type', /json/)

  const response = await request(server)
    .post('/oauth/login')
    .set('Accept', 'application/json')
    .send({code: 'some-code', email: 'tastespuds@gmail.com'})
    .expect(200)
    .expect('Content-Type', /json/)

  expect(response.body).toMatchSnapshot()
})

test('respond with a 422 if `code` is missing', async () => {
  const server = require('../src/server').default

  const response = await request(server)
    .post('/oauth/login')
    .set('Accept', 'application/json')
    .send({email: 'tastespuds@gmail.com'})
    .expect(422)
    .expect('Content-Type', /json/)

  expect(response.body).toMatchSnapshot()
})

afterEach(async () => {
  const database = require('../src/clients/database').default
  const file: string = await readFixture('../__fixtures__/tables.json')
  const json: string[] = JSON.parse(file)

  await database.queryViaText(`TRUNCATE ${json.join(',')} RESTART IDENTITY CASCADE`)
})

afterAll(async () => {
  const database = require('../src/clients/database').default
  await database.close()
})
