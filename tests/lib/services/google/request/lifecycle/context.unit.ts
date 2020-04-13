import { expect } from 'chai';
import sinon from 'sinon';

import { S, T } from '@/lib/constants';
import ContextManager from '@/lib/services/google/request/lifecycle/context';

describe('contextManager unit tests', async () => {
  afterEach(() => sinon.restore());

  describe('build', () => {
    it('works', async () => {
      const outputString = 'output';

      const contextObj = {
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
        createContext: sinon.stub().returns(contextObj),
      };

      const services = {
        state: {
          getFromDb: sinon.stub().resolves(rawState),
        },
        voiceflow: {
          client,
        },
      };
      const contextManager = new ContextManager(services as any, null as any);

      const versionID = 'version-id';
      const userID = 'user-id';

      const result = await contextManager.build(versionID, userID);

      expect(result).to.eql(contextObj);
      expect(services.state.getFromDb.args[0]).to.eql([userID]);
      expect(client.createContext.args[0]).to.eql([versionID, rawState]);
      expect(contextObj.turn.set.args[0]).to.eql([T.PREVIOUS_OUTPUT, outputString]);
      expect(contextObj.storage.get.args[0]).to.eql([S.OUTPUT]);
      expect(contextObj.storage.set.args[0]).to.eql([S.OUTPUT, '']);
    });
  });
});
