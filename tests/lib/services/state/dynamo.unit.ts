import { expect } from 'chai';
import sinon from 'sinon';

import StateManager from '@/lib/services/state/dynamo';

describe('dynamo stateManager unit tests', async () => {
  afterEach(() => sinon.restore());

  describe('saveToDb', () => {
    it('works correctly', async () => {
      const putPromise = sinon.stub();
      const services = {
        docClient: { put: sinon.stub().returns({ promise: putPromise }) },
      };
      const config = {
        SESSIONS_DYNAMO_TABLE: 'sessions_table',
      };

      const stateManager = new StateManager(services as any, config as any);

      const userId = 'user-id';
      const state = { foo: 'bar' };
      await stateManager.saveToDb(userId, state as any);

      expect(services.docClient.put.args[0]).to.eql([
        {
          TableName: config.SESSIONS_DYNAMO_TABLE,
          Item: {
            id: `${StateManager.GACTION_SESSIONS_DYNAMO_PREFIX}.${userId}`,
            state,
          },
        },
      ]);

      expect(putPromise.callCount).to.eql(1);
    });
  });

  describe('getFromDb', () => {
    it('no userId', async () => {
      const config = {
        SESSIONS_DYNAMO_TABLE: 'session-table',
      };
      const services = {
        docClient: {
          get: sinon.stub(),
        },
      };
      const stateManager = new StateManager(services as any, config as any);

      const userId = null;

      expect(await stateManager.getFromDb(userId as any)).to.eql({});
      expect(services.docClient.get.callCount).to.eql(0);
    });

    it('attributes in item', async () => {
      const attributes = { foo: 'bar' };
      const newState = { foo1: 'bar1' };
      const config = {
        SESSIONS_DYNAMO_TABLE: 'session-table',
      };
      const services = {
        docClient: {
          get: sinon.stub().returns({ promise: sinon.stub().returns({ Item: { attributes } }) }),
        },
        adapter: { state: sinon.stub().returns(newState) },
      };
      const stateManager = new StateManager(services as any, config as any);

      const userId = '1';

      expect(await stateManager.getFromDb(userId as any)).to.eql(newState);
      expect(services.docClient.get.callCount).to.eql(1);
      expect(services.adapter.state.args).to.eql([[attributes]]);
    });

    it('no item', async () => {
      const config = {
        SESSIONS_DYNAMO_TABLE: 'session-table',
      };
      const services = {
        docClient: {
          get: sinon.stub().returns({ promise: sinon.stub().returns({}) }),
        },
      };
      const stateManager = new StateManager(services as any, config as any);

      const userId = '1';

      expect(await stateManager.getFromDb(userId as any)).to.eql({});
      expect(services.docClient.get.callCount).to.eql(1);
    });

    it('works correctly', async () => {
      const state = { foo: 'bar' };
      const config = {
        SESSIONS_DYNAMO_TABLE: 'session-table',
      };
      const services = {
        docClient: {
          get: sinon.stub().returns({ promise: sinon.stub().returns({ Item: { state } }) }),
        },
      };
      const stateManager = new StateManager(services as any, config as any);

      const userId = '1';

      expect(await stateManager.getFromDb(userId as any)).to.eql(state);
      expect(services.docClient.get.callCount).to.eql(1);
    });
  });
});
