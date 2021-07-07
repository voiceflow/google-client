import { expect } from 'chai';
import _ from 'lodash';
import sinon from 'sinon';

import { Event, RequestType as InteractRequestType } from '@/lib/clients/ingest-client';
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
      const userId = 'user-id';
      const versionID = 'version-id';
      const finalState = { random: 'runtime', storage: { user: userId } };
      const output = '';

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
          user: userId,
        },
        turn: {
          set: sinon.stub(),
          get: sinon
            .stub()
            .onFirstCall()
            .returns(false)
            .returns(null),
        },
        services: {
          analyticsClient: {
            identify: sinon.stub().returns(true),
            track: sinon.stub().returns(true),
          },
        },
        getVersionID: sinon.stub().returns(versionID),
        getRawState: sinon.stub().returns(versionID),
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
      expect(runtime.services.analyticsClient.track.args).to.eql([
        [
          {
            id: versionID,
            event: Event.INTERACT,
            request: InteractRequestType.RESPONSE,
            payload: res,
            sessionid: userId,
            metadata: runtime.getFinalState(),
          },
        ],
      ]);
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

      const userId = 'user-id';
      const finalState = { random: 'runtime', storage: { user: userId } };
      const output = 'random output';

      const versionID = 'version-id';
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
        services: {
          analyticsClient: {
            identify: sinon.stub().returns(true),
            track: sinon.stub().returns(true),
          },
        },
        getVersionID: sinon.stub().returns(versionID),
        getRawState: sinon.stub().returns(versionID),
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
      expect(runtime.services.analyticsClient.track.args).to.eql([
        [
          {
            id: versionID,
            event: Event.INTERACT,
            request: InteractRequestType.RESPONSE,
            payload: res,
            sessionid: userId,
            metadata: runtime.getFinalState(),
          },
        ],
      ]);
    });
  });
});
