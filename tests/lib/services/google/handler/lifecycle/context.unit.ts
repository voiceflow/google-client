// import { expect } from 'chai';
import sinon from 'sinon';

import ContextManager from '@/lib/services/google/handler/lifecycle/context';

describe('contextManager unit tests', async () => {
  afterEach(() => sinon.restore());

  describe('build', () => {
    it('works', async () => {
      const contextObj = {
        turn: {
          set: sinon.stub(),
        },
        storage: {
          set: sinon.stub(),
          get: sinon.stub().returns('output'),
        },
      };

      const services = {
        state: {
          getFromDb: sinon.stub().resolves({}),
        },
        voiceflow: {
          createContext: sinon.stub().returns(contextObj),
        },
      };
      const contextManager = new ContextManager(services as any, null as any);

      const versionID = 'version-id';
      const userID = 'user-id';

      await contextManager.build(versionID, userID);

      // todo: assertions
    });
  });
});
