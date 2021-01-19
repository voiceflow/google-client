import { expect } from 'chai';
import sinon from 'sinon';

import { T, V } from '@/lib/constants';
import HandlerManager from '@/lib/services/google/request';
import { RequestType } from '@/lib/services/runtime/types';

describe('handlerManager unit tests', async () => {
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    clock = sinon.useFakeTimers(Date.now()); // fake Date.now
  });
  afterEach(() => {
    clock.restore(); // restore Date.now
    sinon.restore();
  });

  describe('dialogflow', () => {
    it('no conv', async () => {
      const services = {};

      const agent = {
        conv: sinon.stub().returns(null),
        add: sinon.stub(),
      };

      const handlerManager = new HandlerManager(services as any, null as any);

      await handlerManager.dialogflow(agent as any);

      expect(agent.conv.callCount).to.eql(1);
      expect(agent.add.callCount).to.eql(1);
    });

    it('main intent', async () => {
      const stateObj = {
        stack: {
          isEmpty: sinon.stub().returns(false),
        },
        variables: {
          set: sinon.stub(),
        },
        update: sinon.stub(),
      };

      const services = {
        initialize: {
          build: sinon.stub(),
        },
        runtimeClient: {
          build: sinon.stub().returns(stateObj),
        },
        response: {
          build: sinon.stub(),
        },
      };

      const convObj = {
        input: {
          raw: 'input raw',
        },
        user: {
          storage: {
            userId: 'user-id',
          },
        },
        body: {
          versionID: 'version-id',
        },
      };

      const agent = {
        intent: 'actions.intent.MAIN',
        parameters: [],
        conv: sinon.stub().returns(convObj),
      };

      const handlerManager = new HandlerManager(services as any, null as any);

      await handlerManager.dialogflow(agent as any);

      expect(agent.conv.callCount).to.eql(1);
      expect(services.runtimeClient.build.args[0]).to.eql([convObj.body.versionID, convObj.user.storage.userId]);
      expect(services.initialize.build.args[0]).to.eql([stateObj, convObj]);
      expect(stateObj.variables.set.args).to.eql([[V.TIMESTAMP, Math.floor(clock.now / 1000)]]);
      expect(stateObj.update.callCount).to.eql(1);
      expect(services.response.build.args[0]).to.eql([stateObj, agent, convObj]);
    });

    it('default welcome intent', async () => {
      const stateObj = {
        stack: {
          isEmpty: sinon.stub().returns(false),
        },
        variables: {
          set: sinon.stub(),
        },
        update: sinon.stub(),
      };

      const services = {
        initialize: {
          build: sinon.stub(),
        },
        runtimeClient: {
          build: sinon.stub().returns(stateObj),
        },
        response: {
          build: sinon.stub(),
        },
      };

      const convObj = {
        input: {
          raw: 'input raw',
        },
        user: {
          storage: {
            userId: 'user-id',
          },
        },
        body: {
          versionID: 'version-id',
        },
      };

      const agent = {
        intent: 'Default Welcome Intent',
        parameters: [],
        conv: sinon.stub().returns(convObj),
      };

      const handlerManager = new HandlerManager(services as any, null as any);

      await handlerManager.dialogflow(agent as any);

      expect(agent.conv.callCount).to.eql(1);
      expect(services.runtimeClient.build.args[0]).to.eql([convObj.body.versionID, convObj.user.storage.userId]);
      expect(services.initialize.build.args[0]).to.eql([stateObj, convObj]);
      expect(stateObj.update.callCount).to.eql(1);
      expect(services.response.build.args[0]).to.eql([stateObj, agent, convObj]);
    });

    it('stack empty', async () => {
      const stateObj = {
        stack: {
          isEmpty: sinon.stub().returns(true),
        },
        variables: {
          set: sinon.stub(),
        },
        update: sinon.stub(),
      };

      const services = {
        initialize: {
          build: sinon.stub(),
        },
        runtimeClient: {
          build: sinon.stub().returns(stateObj),
        },
        response: {
          build: sinon.stub(),
        },
      };

      const convObj = {
        input: {
          raw: 'input raw',
        },
        user: {
          storage: {
            userId: 'user-id',
          },
        },
        body: {
          versionID: 'version-id',
        },
      };

      const agent = {
        intent: 'random intent',
        parameters: [],
        conv: sinon.stub().returns(convObj),
      };

      const handlerManager = new HandlerManager(services as any, null as any);

      await handlerManager.dialogflow(agent as any);

      expect(agent.conv.callCount).to.eql(1);
      expect(services.runtimeClient.build.args[0]).to.eql([convObj.body.versionID, convObj.user.storage.userId]);
      expect(services.initialize.build.args[0]).to.eql([stateObj, convObj]);
      expect(stateObj.update.callCount).to.eql(1);
      expect(services.response.build.args[0]).to.eql([stateObj, agent, convObj]);
    });

    it('existing session', async () => {
      const stateObj = {
        stack: {
          isEmpty: sinon.stub().returns(false),
        },
        variables: {
          set: sinon.stub(),
        },
        update: sinon.stub(),
        turn: {
          set: sinon.stub(),
        },
      };

      const services = {
        initialize: {
          build: sinon.stub(),
        },
        runtimeClient: {
          build: sinon.stub().returns(stateObj),
        },
        response: {
          build: sinon.stub(),
        },
      };

      const convObj = {
        input: {
          raw: 'input raw',
        },
        user: {
          storage: {
            userId: 'user-id',
          },
        },
        body: {
          versionID: 'version-id',
        },
      };

      const agent = {
        intent: 'random intent',
        parameters: [],
        conv: sinon.stub().returns(convObj),
      };

      const handlerManager = new HandlerManager(services as any, null as any);

      await handlerManager.dialogflow(agent as any);

      expect(agent.conv.callCount).to.eql(1);
      expect(services.runtimeClient.build.args[0]).to.eql([convObj.body.versionID, convObj.user.storage.userId]);
      expect(stateObj.turn.set.args[0]).to.eql([
        T.REQUEST,
        {
          type: RequestType.INTENT,
          payload: {
            intent: agent.intent,
            input: convObj.input.raw,
            slots: agent.parameters,
          },
        },
      ]);
      expect(stateObj.update.callCount).to.eql(1);
      expect(services.response.build.args[0]).to.eql([stateObj, agent, convObj]);
    });
  });
});
