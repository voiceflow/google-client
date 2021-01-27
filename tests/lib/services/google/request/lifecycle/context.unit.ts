import { expect } from 'chai';
import sinon from 'sinon';

import { S, T } from '@/lib/constants';
import RuntimeClientManager from '@/lib/services/google/request/lifecycle/runtime';

describe('runtimeClientManager unit tests', async () => {
  describe('build', () => {
    it('works', async () => {
      const outputString = 'output';

      const stateObj = {
        turn: {
          set: sinon.stub(),
        },
        storage: {
          set: sinon.stub(),
          get: sinon.stub().returns(outputString),
        },
      };

      const rawState = { foo: 'bar' };

      const client = {
        createRuntime: sinon.stub().returns(stateObj),
      };

      const services = {
        state: {
          getFromDb: sinon.stub().resolves(rawState),
        },
        runtimeClient: client,
      };
      const runtimeClientManager = new RuntimeClientManager(services as any, null as any);

      const versionID = 'version-id';
      const userID = 'user-id';

      const result = await runtimeClientManager.build(versionID, userID);

      expect(result).to.eql(stateObj);
      expect(services.state.getFromDb.args[0]).to.eql([userID]);
      expect(client.createRuntime.args[0]).to.eql([versionID, rawState]);
      expect(stateObj.turn.set.args[0]).to.eql([T.PREVIOUS_OUTPUT, outputString]);
      expect(stateObj.storage.get.args[0]).to.eql([S.OUTPUT]);
      expect(stateObj.storage.set.args[0]).to.eql([S.OUTPUT, '']);
    });
  });
});
