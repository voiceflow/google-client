import { expect } from 'chai';
import sinon from 'sinon';

import { Event, RequestType as InteractRequestType } from '@/lib/clients/ingest-client';
import { T, V } from '@/lib/constants';
import DialogflowManager from '@/lib/services/dialogflow';
import { RequestType } from '@/lib/services/runtime/types';

describe('DialogflowManager unit tests', async () => {
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    clock = sinon.useFakeTimers(Date.now()); // fake Date.now
  });
  afterEach(() => {
    clock.restore(); // restore Date.now
    sinon.restore();
  });

  describe('dialogflow', () => {
    it('main intent', async () => {
      const versionID = 'version-id';
      const stateObj = {
        stack: {
          isEmpty: sinon.stub().returns(false),
        },
        variables: {
          set: sinon.stub(),
        },
        update: sinon.stub(),
        services: {
          analyticsClient: {
            identify: sinon.stub().returns(true),
            track: sinon.stub().returns(true),
          },
        },
        getVersionID: sinon.stub().returns(versionID),
        getRawState: sinon.stub().returns(versionID),
      };

      const services = {
        initializeES: {
          build: sinon.stub(),
        },
        runtimeBuildES: {
          build: sinon.stub().returns(stateObj),
        },
        responseES: {
          build: sinon.stub(),
        },
        metrics: {
          invocation: sinon.stub(),
        },
      };

      const req = {
        queryResult: { intent: { displayName: 'actions.intent.MAIN' }, queryText: 'main intent' },
        session: 'user-id',
      };

      const dialogflow = new DialogflowManager(services as any, null as any);

      await dialogflow.es(req as any, versionID);

      const payload = {
        payload: {
          input: 'main intent',
          intent: 'actions.intent.MAIN',
          slots: undefined,
        },
        type: 'INTENT',
      };
      expect(services.metrics.invocation.args).to.eql([[]]);
      expect(services.runtimeBuildES.build.args).to.eql([[versionID, req.session]]);
      expect(services.initializeES.build.args).to.eql([[stateObj, req]]);
      expect(stateObj.variables.set.args).to.eql([[V.TIMESTAMP, Math.floor(clock.now / 1000)]]);
      expect(stateObj.update.args).to.eql([[]]);
      expect(services.responseES.build.args).to.eql([[stateObj]]);
      expect(stateObj.services.analyticsClient.track.args).to.eql([
        [
          {
            id: versionID,
            event: Event.INTERACT,
            request: InteractRequestType.LAUNCH,
            payload,
            sessionid: req.session,
            metadata: versionID,
          },
        ],
      ]);
    });

    it('default welcome intent', async () => {
      const versionID = 'version-id';
      const stateObj = {
        stack: {
          isEmpty: sinon.stub().returns(false),
        },
        variables: {
          set: sinon.stub(),
        },
        update: sinon.stub(),
        services: {
          analyticsClient: {
            identify: sinon.stub().returns(true),
            track: sinon.stub().returns(true),
          },
        },
        getVersionID: sinon.stub().returns(versionID),
        getRawState: sinon.stub().returns(versionID),
      };

      const services = {
        initializeES: {
          build: sinon.stub(),
        },
        runtimeBuildES: {
          build: sinon.stub().returns(stateObj),
        },
        responseES: {
          build: sinon.stub(),
        },
        metrics: {
          invocation: sinon.stub(),
        },
      };

      const req = {
        queryResult: { intent: { displayName: 'Default Welcome Intent' }, queryText: 'default welcome intent' },
        session: 'user-id',
      };

      const dialogflow = new DialogflowManager(services as any, null as any);

      await dialogflow.es(req as any, versionID);
      const payload = {
        payload: {
          input: 'default welcome intent',
          intent: 'Default Welcome Intent',
          slots: undefined,
        },
        type: 'INTENT',
      };

      expect(services.metrics.invocation.args).to.eql([[]]);
      expect(services.runtimeBuildES.build.args).to.eql([[versionID, req.session]]);
      expect(services.initializeES.build.args).to.eql([[stateObj, req]]);
      expect(stateObj.variables.set.args).to.eql([[V.TIMESTAMP, Math.floor(clock.now / 1000)]]);
      expect(stateObj.update.args).to.eql([[]]);
      expect(services.responseES.build.args).to.eql([[stateObj]]);
      expect(stateObj.services.analyticsClient.track.args).to.eql([
        [
          {
            id: versionID,
            event: Event.INTERACT,
            request: InteractRequestType.LAUNCH,
            payload,
            sessionid: req.session,
            metadata: versionID,
          },
        ],
      ]);
    });

    it('stack empty', async () => {
      const versionID = 'version-id';
      const stateObj = {
        turn: {
          set: sinon.stub(),
        },
        stack: {
          isEmpty: sinon.stub().returns(true),
        },
        variables: {
          set: sinon.stub(),
        },
        update: sinon.stub(),
        services: {
          analyticsClient: {
            identify: sinon.stub().returns(true),
            track: sinon.stub().returns(true),
          },
        },
        getVersionID: sinon.stub().returns(versionID),
        getRawState: sinon.stub().returns(versionID),
      };

      const services = {
        initializeES: {
          build: sinon.stub(),
        },
        runtimeBuildES: {
          build: sinon.stub().returns(stateObj),
        },
        responseES: {
          build: sinon.stub(),
        },
        metrics: {
          invocation: sinon.stub(),
        },
      };

      const req = {
        queryResult: { intent: { displayName: 'random intent' }, parameters: { s1: 'v1', s2: 'v2' }, queryText: 'random' },
        session: 'user-id',
      };

      const dialogflow = new DialogflowManager(services as any, null as any);

      await dialogflow.es(req as any, versionID);

      expect(services.metrics.invocation.args).to.eql([[]]);
      expect(services.runtimeBuildES.build.args).to.eql([[versionID, req.session]]);
      expect(services.initializeES.build.args).to.eql([[stateObj, req]]);
      expect(stateObj.turn.set.args[0]).to.eql([
        T.REQUEST,
        {
          type: RequestType.INTENT,
          payload: {
            intent: req.queryResult.intent.displayName,
            input: req.queryResult.queryText,
            slots: req.queryResult.parameters,
          },
        },
      ]);
      expect(stateObj.variables.set.args).to.eql([[V.TIMESTAMP, Math.floor(clock.now / 1000)]]);
      expect(stateObj.update.args).to.eql([[]]);
      expect(services.responseES.build.args).to.eql([[stateObj]]);
    });

    it('existing session', async () => {
      const versionID = 'version-id';
      const stateObj = {
        turn: { set: sinon.stub() },
        stack: {
          isEmpty: sinon.stub().returns(false),
        },
        variables: {
          set: sinon.stub(),
        },
        update: sinon.stub(),
        services: {
          analyticsClient: {
            identify: sinon.stub().returns(true),
            track: sinon.stub().returns(true),
          },
        },
        getVersionID: sinon.stub().returns(versionID),
        getRawState: sinon.stub().returns(versionID),
      };

      const services = {
        runtimeBuildES: {
          build: sinon.stub().returns(stateObj),
        },
        responseES: {
          build: sinon.stub(),
        },
        metrics: {
          invocation: sinon.stub(),
        },
      };

      const req = {
        queryResult: { intent: { displayName: 'random intent' }, queryText: 'random', parameters: { s1: 'v1', s2: 'v2' } },
        session: 'user-id',
      };

      const dialogflow = new DialogflowManager(services as any, null as any);

      await dialogflow.es(req as any, versionID);
      const payload = {
        payload: {
          input: 'random',
          intent: 'random intent',
          slots: { s1: 'v1', s2: 'v2' },
        },
        type: 'INTENT',
      };

      expect(services.metrics.invocation.args).to.eql([[]]);
      expect(services.runtimeBuildES.build.args).to.eql([[versionID, req.session]]);
      expect(stateObj.turn.set.args[0]).to.eql([
        T.REQUEST,
        {
          type: RequestType.INTENT,
          payload: {
            intent: req.queryResult.intent.displayName,
            input: req.queryResult.queryText,
            slots: req.queryResult.parameters,
          },
        },
      ]);
      expect(stateObj.variables.set.args).to.eql([[V.TIMESTAMP, Math.floor(clock.now / 1000)]]);
      expect(stateObj.update.args).to.eql([[]]);
      expect(services.responseES.build.args).to.eql([[stateObj]]);
      expect(stateObj.services.analyticsClient.track.args).to.eql([
        [
          {
            id: versionID,
            event: Event.INTERACT,
            request: InteractRequestType.REQUEST,
            payload,
            sessionid: req.session,
            metadata: versionID,
          },
        ],
      ]);
    });
  });
});
