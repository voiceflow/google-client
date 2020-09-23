import { expect } from 'chai';
import _ from 'lodash';
import sinon from 'sinon';

import { S, T } from '@/lib/constants';
import ResponseManager from '@/lib/services/googleV2/request/lifecycle/response';

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
          responseHandlersV2: [responseHandler1, responseHandler2],
          Simple: sinon.stub().returns(response),
        },
      };

      const responseManager = new ResponseManager(services as any, null as any);

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
          get: sinon
            .stub()
            .onFirstCall()
            .returns(false)
            .returns(null),
        },
      };

      const conv = {
        user: {
          params: { forceUpdateToken: '' },
        },
        add: sinon.stub(),
      };

      await responseManager.build(context as any, conv as any);

      expect(context.stack.isEmpty.callCount).to.eql(1);
      expect(context.storage.get.args).to.eql([[S.OUTPUT], [S.OUTPUT], [S.USER]]);
      expect(services.utils.Simple.args[0]).to.eql([
        {
          speech: `<speak>${output}</speak>`,
          text: '🔊',
        },
      ]);
      expect(conv.add.args[0]).to.eql([response]);
      expect(responseHandler1.args).to.eql([[context, conv]]);
      expect(responseHandler2.args).to.eql([[context, conv]]);
      expect(services.state.saveToDb.args[0]).to.eql([userId, contextFinalState]);
      expect(conv.user.params.forceUpdateToken).to.deep.eq(updateToken);
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
          responseHandlersV2: [responseHandler1, responseHandler2],
          Simple: sinon.stub().returns(response),
        },
      };

      const responseManager = new ResponseManager(services as any, null as any);

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

      const conv = {
        user: {
          params: { forceUpdateToken: '' },
        },
        add: sinon.stub(),
        scene: {
          next: { name: '' },
        },
      };

      await responseManager.build(context as any, conv as any);

      expect(context.stack.isEmpty.callCount).to.eql(1);
      expect(context.turn.set.args[0]).to.eql([T.END, true]);
      expect(context.storage.get.args).to.eql([[S.OUTPUT], [S.OUTPUT], [S.USER]]);
      expect(services.utils.Simple.args[0]).to.eql([
        {
          speech: `<speak>${output}</speak>`,
          text: undefined,
        },
      ]);
      expect(conv.scene.next.name).to.eql('actions.scene.END_CONVERSATION');
      expect(conv.add.args[0]).to.eql([response]);
      expect(responseHandler1.args).to.eql([[context, conv]]);
      expect(responseHandler2.args).to.eql([[context, conv]]);
      expect(services.state.saveToDb.args[0]).to.eql([userId, contextFinalState]);
      expect(conv.user.params.forceUpdateToken).to.deep.eq(updateToken);
    });
  });
});
