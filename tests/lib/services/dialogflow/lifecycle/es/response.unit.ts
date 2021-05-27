import { expect } from 'chai';
import _ from 'lodash';
import sinon from 'sinon';

import { S, T } from '@/lib/constants';
import ResponseManager from '@/lib/services/dialogflow/lifecycle/es/response';

describe('responseManager unit tests', async () => {
  afterEach(() => sinon.restore());

  describe('build', () => {
    it('no output', async () => {
      const responseHandler1 = sinon.stub();
      const responseHandler2 = sinon.stub();

      const services = {
        state: { saveToDb: sinon.stub() },
        utils: {
          responseHandlersDialogflowES: [responseHandler1, responseHandler2],
        },
      };

      const responseManager = new ResponseManager(services as any, null as any);

      const finalState = { random: 'runtime' };
      const output = '';
      const userId = 'user-id';
      const storageGet = sinon.stub();
      storageGet.withArgs(S.OUTPUT).returns(output);
      storageGet.withArgs(S.USER).returns(userId);

      const runtime = {
        getFinalState: sinon.stub().returns(finalState),
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

      const res = {
        fulfillmentText: output,
        fulfillmentMessages: [{ text: { text: [output] } }],
        endInteraction: false,
      };

      expect(await responseManager.build(runtime as any)).to.eql(res);

      expect(runtime.stack.isEmpty.callCount).to.eql(1);
      expect(runtime.storage.get.args).to.eql([[S.OUTPUT], [S.USER]]);
      expect(responseHandler1.args).to.eql([[runtime, res]]);
      expect(responseHandler2.args).to.eql([[runtime, res]]);
      expect(services.state.saveToDb.args[0]).to.eql([userId, finalState]);
    });

    it('empty stack', async () => {
      const responseHandler1 = sinon.stub();
      const responseHandler2 = sinon.stub();

      const services = {
        state: { saveToDb: sinon.stub() },
        utils: {
          responseHandlersDialogflowES: [responseHandler1, responseHandler2],
        },
      };

      const responseManager = new ResponseManager(services as any, null as any);

      const finalState = { random: 'runtime' };
      const output = 'random output';
      const userId = 'user-id';
      const storageGet = sinon.stub();
      storageGet.withArgs(S.OUTPUT).returns(output);
      storageGet.withArgs(S.USER).returns(userId);

      const runtime = {
        getFinalState: sinon.stub().returns(finalState),
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

      const res = {
        fulfillmentText: output,
        fulfillmentMessages: [{ text: { text: [output] } }],
        endInteraction: true,
      };

      expect(await responseManager.build(runtime as any)).to.eql(res);

      expect(runtime.stack.isEmpty.callCount).to.eql(1);
      expect(runtime.turn.set.args[0]).to.eql([T.END, true]);
      expect(runtime.storage.get.args).to.eql([[S.OUTPUT], [S.USER]]);
      expect(responseHandler1.args).to.eql([[runtime, res]]);
      expect(responseHandler2.args).to.eql([[runtime, res]]);
      expect(services.state.saveToDb.args[0]).to.eql([userId, finalState]);
    });
  });
});
