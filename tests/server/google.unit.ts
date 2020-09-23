import { expect } from 'chai';
import sinon from 'sinon';
import request from 'supertest';

import GetApp from '../getAppForTest';
import fixtures from './fixture';

const tests = [
  {
    method: 'post',
    calledPath: '/state/skill/gactions/:versionID',
    expected: {
      controllers: {
        google: {
          handler: 1,
        },
      },
      middlewares: {},
      validations: {},
    },
  },
  {
    method: 'post',
    calledPath: '/webhook/:versionID',
    expected: {
      controllers: {
        google: {
          handlerV2: 1,
        },
      },
      middlewares: {},
      validations: {},
    },
  },
];

describe('google route unit tests', () => {
  let app;
  let server: any;

  afterEach(async () => {
    sinon.restore();
    await server.stop();
  });

  tests.forEach((test) => {
    it(`${test.method} ${test.calledPath}`, async () => {
      const fixture = await fixtures.createFixture();
      ({ app, server } = await GetApp(fixture));

      const response = await request(app)[test.method](test.calledPath);

      fixtures.checkFixture(fixture, test.expected);
      expect(response.body).to.eql({ done: 'done' });
    });
  });
});
