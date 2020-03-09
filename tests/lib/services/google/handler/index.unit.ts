// import { expect } from 'chai';
import sinon from 'sinon';

import HandlerManager from '@/lib/services/google/handler';

describe('handlerManager unit tests', async () => {
  afterEach(() => sinon.restore());

  describe('dialogflow', () => {
    it('main or welcome intent', async () => {
      const contextObj = {
        stack: {
          isEmpty: sinon.stub().returns(false),
        },
        turn: {
          set: sinon.stub(),
        },
        update: sinon.stub(),
      };

      const services = {
        initialize: {
          build: sinon.stub(),
        },
        context: {
          build: sinon.stub().returns(contextObj),
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
        intent: '',
        parameters: [],
        conv: sinon.stub().returns(convObj),
      };

      const handlerManager = new HandlerManager(services as any, null as any);

      await handlerManager.dialogflow(agent as any);

      // todo: assertions
    });
  });
});
