import { expect } from 'chai';
import sinon from 'sinon';

import StateManager from '@/lib/services/state';

describe('stateManager unit tests', async () => {
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
});
