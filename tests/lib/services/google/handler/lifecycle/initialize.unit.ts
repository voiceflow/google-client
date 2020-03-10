// import { expect } from 'chai';
import sinon from 'sinon';

import InitializeManager from '@/lib/services/google/handler/lifecycle/initialize';

describe('initializeManager unit tests', async () => {
  afterEach(() => sinon.restore());

  describe('build', () => {
    it('works', async () => {
      const resumeFrame = { foo: 'bar' };
      const services = {
        uuid4: sinon.stub().returns(1),
        utils: {
          resume: {
            createResumeFrame: sinon.stub().returns(resumeFrame),
            RESUME_DIAGRAM_ID: 'resume-id',
          },
          client: {
            Store: {
              initialize: sinon.stub(),
            },
            Frame: sinon.stub(),
          },
        },
      };
      const contextManager = new InitializeManager(services as any, null as any);

      const metaObj = {
        repeat: 2,
        global: ['a', 'b', 'c'],
        restart: true,
        diagram: 'diagram-id',
        resume_prompt: null,
      };
      const context = {
        fetchMetadata: sinon.stub().resolves(metaObj),
        stack: {
          isEmpty: sinon.stub().returns(false),
          flush: sinon.stub(),
          push: sinon.stub(),
          top: sinon.stub().returns({
            storage: {
              set: sinon.stub(),
              delete: sinon.stub(),
              get: sinon.stub().returns(null),
            },
          }),
        },
        storage: {
          get: sinon.stub().returns(null),
          set: sinon.stub(),
        },
        variables: {
          merge: sinon.stub(),
        },
      };

      const conv = {
        user: {
          locale: 'en',
          storage: {},
        },
      };

      await contextManager.build(context as any, conv as any);

      // todo: assertions
    });
  });
});
