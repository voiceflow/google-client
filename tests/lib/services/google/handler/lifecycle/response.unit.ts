// import { expect } from 'chai';
import sinon from 'sinon';

import ResponseManager from '@/lib/services/google/handler/lifecycle/response';

describe('initializeManager unit tests', async () => {
  afterEach(() => sinon.restore());

  describe('build', () => {
    it('works', async () => {
      const services = {
        state: { saveToDb: sinon.stub() },
        randomstring: { generate: sinon.stub().returns('update-token') },
        utils: {
          responseHandlers: [sinon.stub().resolves(), sinon.stub().resolves()],
        },
      };

      const contextManager = new ResponseManager(services as any, null as any);

      const context = {
        getFinalState: sinon.stub().returns({ foo: 'bar' }),
        stack: {
          isEmpty: sinon.stub().returns(false),
        },
        storage: {
          get: sinon.stub().returns(''),
        },
        turn: {
          set: sinon.stub(),
          get: sinon.stub().returns(true),
        },
      };

      const agent = {
        add: sinon.stub(),
      };

      const conv = {
        user: {
          storage: { forceUpdateToken: '' },
        },
        close: sinon.stub(),
        ask: sinon.stub(),
      };

      await contextManager.build(context as any, agent as any, conv as any);

      // todo: assertions
    });
  });
});
