import { expect } from 'chai';
import _ from 'lodash';
import sinon from 'sinon';

import { S, T } from '@/lib/constants';
import ResponseManager from '@/lib/services/google/request/lifecycle/response';

describe('responseManager unit tests', async () => {
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

      const responseManager = new ResponseManager(services as any, null as any);

      const runtimeFinalState = { random: 'runtime' };
      const output = '';
      const userId = 'user-id';
      const storageGet = sinon.stub();
      storageGet.withArgs(S.OUTPUT).returns(output);
      storageGet.withArgs(S.REPROMPT).returns(null);
      storageGet.withArgs(S.USER).returns(userId);

      const runtime = {
        getFinalState: sinon.stub().returns(runtimeFinalState),
        stack: {
          isEmpty: sinon.stub().returns(false),
        },
        storage: {
          get: storageGet,
        },
        turn: {
          set: sinon.stub(),
          get: sinon
            .stub()
            .onFirstCall()
            .returns(false),
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

      await responseManager.build(runtime as any, agent as any, conv as any);

      expect(runtime.stack.isEmpty.callCount).to.eql(1);
      expect(runtime.storage.get.args).to.eql([[S.OUTPUT], [S.REPROMPT], [S.USER]]);
      expect(services.utils.SimpleResponse.args[0]).to.eql([
        {
          speech: `<speak>${output}</speak>`,
          text: '🔊',
        },
      ]);
      expect(conv.ask.args[0]).to.eql([response]);
      expect(_.get(conv, 'noInputs')).to.eql([{ ssml: `<speak>${output}</speak>` }]);
      expect(responseHandler1.args).to.eql([[runtime, conv]]);
      expect(responseHandler2.args).to.eql([[runtime, conv]]);
      expect(services.state.saveToDb.args[0]).to.eql([userId, runtimeFinalState]);
      expect(agent.add.args[0]).to.eql([conv]);
      expect(agent.add.args[0][0].user.storage.forceUpdateToken).to.deep.eq(updateToken);
    });

    it('with reprompt', async () => {
      const response = { foo: 'bar' };
      const updateToken = 'update-token';
      const reprompt = 'REPROMPT';
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

      const responseManager = new ResponseManager(services as any, null as any);

      const runtimeFinalState = { random: 'runtime' };
      const output = '';
      const userId = 'user-id';
      const storageGet = sinon.stub();
      storageGet.withArgs(S.OUTPUT).returns(output);
      storageGet.withArgs(S.REPROMPT).returns(reprompt);
      storageGet.withArgs(S.USER).returns(userId);

      const runtime = {
        getFinalState: sinon.stub().returns(runtimeFinalState),
        stack: {
          isEmpty: sinon.stub().returns(false),
        },
        storage: {
          get: storageGet,
        },
        turn: {
          set: sinon.stub(),
          get: sinon
            .stub()
            .onFirstCall()
            .returns(false),
        },
      };

      const agent = {
        add: sinon.stub(),
      };

      const conv = {
        user: {
          storage: { forceUpdateToken: '' },
        },
        ask: sinon.stub(),
      };

      await responseManager.build(runtime as any, agent as any, conv as any);

      expect(_.get(conv, 'noInputs')).to.eql([{ ssml: `<speak>${reprompt}</speak>` }]);
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

      const responseManager = new ResponseManager(services as any, null as any);

      const runtimeFinalState = { random: 'runtime' };
      const output = 'random output';
      const userId = 'user-id';
      const storageGet = sinon.stub();
      storageGet.withArgs(S.OUTPUT).returns(output);
      storageGet.withArgs(S.USER).returns(userId);

      const runtime = {
        getFinalState: sinon.stub().returns(runtimeFinalState),
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

      await responseManager.build(runtime as any, agent as any, conv as any);

      expect(runtime.stack.isEmpty.callCount).to.eql(1);
      expect(runtime.turn.set.args[0]).to.eql([T.END, true]);
      expect(runtime.storage.get.args).to.eql([[S.OUTPUT], [S.USER]]);
      expect(services.utils.SimpleResponse.args[0]).to.eql([
        {
          speech: `<speak>${output}</speak>`,
          text: undefined,
        },
      ]);
      expect(conv.close.args[0]).to.eql([response]);
      expect(responseHandler1.args).to.eql([[runtime, conv]]);
      expect(responseHandler2.args).to.eql([[runtime, conv]]);
      expect(services.state.saveToDb.args[0]).to.eql([userId, runtimeFinalState]);
      expect(agent.add.args[0]).to.eql([conv]);
      expect(agent.add.args[0][0].user.storage.forceUpdateToken).to.deep.eq(updateToken);
    });
  });
});
