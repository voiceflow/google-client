import { expect } from 'chai';
import sinon from 'sinon';

import { S, T } from '@/lib/constants';
import ResponseManager from '@/lib/services/google/handler/lifecycle/response';

describe('initializeManager unit tests', async () => {
  afterEach(() => sinon.restore());

  describe('build', () => {
    it('no output', async () => {
      const response = { foo: 'bar' };
      const updateToken = 'update-token';
      const responseHandler1 = sinon.stub();
      const responseHandler2 = sinon.stub();

      const services = {
        state: { saveToDb: sinon.stub() },
        randomstring: { generate: sinon.stub().returns(updateToken) },
        utils: {
          responseHandlers: [responseHandler1, responseHandler2],
          SimpleResponse: sinon.stub().returns(response),
        },
      };

      const contextManager = new ResponseManager(services as any, null as any);

      const contextFinalState = { random: 'context' };
      const output = '';
      const userId = 'user-id';
      const storageGet = sinon.stub();
      storageGet.withArgs(S.OUTPUT).returns(output);
      storageGet.withArgs(S.USER).returns(userId);

      const context = {
        getFinalState: sinon.stub().returns(contextFinalState),
        stack: {
          isEmpty: sinon.stub().returns(false),
        },
        storage: {
          get: storageGet,
        },
        turn: {
          set: sinon.stub(),
          get: sinon.stub().returns(false),
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

      expect(context.stack.isEmpty.callCount).to.eql(1);
      expect(context.storage.get.args).to.eql([[S.OUTPUT], [S.OUTPUT], [S.USER]]);
      expect(services.utils.SimpleResponse.args[0]).to.eql([
        {
          speech: `<speak>${output}</speak>`,
          text: '🔊',
        },
      ]);
      expect(conv.ask.args[0]).to.eql([response]);
      expect(responseHandler1.args).to.eql([[context, conv]]);
      expect(responseHandler2.args).to.eql([[context, conv]]);
      expect(services.state.saveToDb.args[0]).to.eql([userId, contextFinalState]);
      expect(agent.add.args[0]).to.eql([conv]);
      expect(agent.add.args[0][0].user.storage.forceUpdateToken).to.deep.eq(updateToken);
    });

    it('empty stack', async () => {
      const response = { foo: 'bar' };
      const updateToken = 'update-token';
      const responseHandler1 = sinon.stub();
      const responseHandler2 = sinon.stub();

      const services = {
        state: { saveToDb: sinon.stub() },
        randomstring: { generate: sinon.stub().returns(updateToken) },
        utils: {
          responseHandlers: [responseHandler1, responseHandler2],
          SimpleResponse: sinon.stub().returns(response),
        },
      };

      const contextManager = new ResponseManager(services as any, null as any);

      const contextFinalState = { random: 'context' };
      const output = 'random output';
      const userId = 'user-id';
      const storageGet = sinon.stub();
      storageGet.withArgs(S.OUTPUT).returns(output);
      storageGet.withArgs(S.USER).returns(userId);

      const context = {
        getFinalState: sinon.stub().returns(contextFinalState),
        stack: {
          isEmpty: sinon.stub().returns(true),
        },
        storage: {
          get: storageGet,
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

      expect(context.stack.isEmpty.callCount).to.eql(1);
      expect(context.turn.set.args[0]).to.eql([T.END, true]);
      expect(context.storage.get.args).to.eql([[S.OUTPUT], [S.OUTPUT], [S.USER]]);
      expect(services.utils.SimpleResponse.args[0]).to.eql([
        {
          speech: `<speak>${output}</speak>`,
          text: undefined,
        },
      ]);
      expect(conv.close.args[0]).to.eql([response]);
      expect(responseHandler1.args).to.eql([[context, conv]]);
      expect(responseHandler2.args).to.eql([[context, conv]]);
      expect(services.state.saveToDb.args[0]).to.eql([userId, contextFinalState]);
      expect(agent.add.args[0]).to.eql([conv]);
      expect(agent.add.args[0][0].user.storage.forceUpdateToken).to.deep.eq(updateToken);
    });
  });
});
