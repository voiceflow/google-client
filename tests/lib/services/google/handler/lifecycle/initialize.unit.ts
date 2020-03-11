import { expect } from 'chai';
import sinon from 'sinon';

import { F, S } from '@/lib/constants';
import InitializeManager from '@/lib/services/google/handler/lifecycle/initialize';

describe('initializeManager unit tests', async () => {
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    clock = sinon.useFakeTimers(Date.now()); // fake Date.now
  });
  afterEach(() => {
    clock.restore(); // restore Date.now
    sinon.restore();
  });

  describe('build', () => {
    const generateFakes = () => {
      const randomUserId = 'random-user-id';
      const resumeFrame = { foo: 'bar' };
      const services = {
        uuid4: sinon.stub().returns(randomUserId),
        utils: {
          resume: {
            createResumeFrame: sinon.stub().returns(resumeFrame),
            RESUME_DIAGRAM_ID: 'resume-id',
          },
          client: {
            Store: {
              initialize: sinon.stub(),
            },
            Frame: sinon.stub().returns('frame'),
          },
        },
      };

      const metaObj = {
        repeat: 2,
        global: ['a', 'b', 'c'],
        restart: true,
        diagram: 'diagram-id',
        resume_prompt: null,
      };

      const topStorage = {
        set: sinon.stub(),
        delete: sinon.stub(),
        get: sinon.stub().returns(null),
      };

      const context = {
        fetchMetadata: sinon.stub().resolves(metaObj),
        stack: {
          isEmpty: sinon.stub().returns(false),
          flush: sinon.stub(),
          push: sinon.stub(),
          top: sinon.stub().returns({
            storage: topStorage,
          }),
          getFrames: sinon.stub(),
          popTo: sinon.stub(),
        },
        storage: {
          get: sinon.stub().returns(true),
          set: sinon.stub(),
          produce: sinon.stub(),
        },
        variables: {
          get: sinon.stub(),
          merge: sinon.stub(),
        },
      };

      const conv = {
        user: {
          locale: 'en',
          storage: {},
        },
      };

      return {
        randomUserId,
        resumeFrame,
        services,
        metaObj,
        context,
        conv,
        topStorage,
      };
    };

    it('first session', async () => {
      const { randomUserId, services, metaObj, context, conv } = generateFakes();

      const storageGet = sinon.stub();
      storageGet
        .withArgs(S.SESSIONS)
        .onFirstCall()
        .returns(null)
        .onSecondCall()
        .returns(1);
      const locale = 'en';
      storageGet.withArgs(S.LOCALE).returns(locale);
      const userId = 'user-id';
      storageGet.withArgs(S.USER).returns(userId);
      const lastSpeak = 'last speak';
      storageGet.withArgs(F.SPEAK).returns(lastSpeak);

      context.storage.get = storageGet;

      const contextManager = new InitializeManager(services as any, null as any);

      await contextManager.build(context as any, conv as any);

      expect(context.storage.get.args[0]).to.eql([S.SESSIONS]);
      expect(context.storage.set.args[0]).to.eql([S.SESSIONS, 1]);
      expect(context.storage.set.args[1]).to.eql([S.LOCALE, conv.user.locale]);
      expect(services.uuid4.callCount).to.eql(1);
      expect(context.storage.set.args[2]).to.eql([S.USER, randomUserId]);
      expect(context.storage.set.args[3]).to.eql([S.REPEAT, metaObj.repeat]);
      expect(context.variables.merge.args[0]).to.eql([
        {
          timestamp: Math.floor(clock.now / 1000),
          locale,
          user_id: userId,
          sessions: 1,
          platform: 'google',
          [InitializeManager.VAR_VF]: {
            events: [],
          },
        },
      ]);
      expect(services.utils.client.Store.initialize.args[0]).to.eql([context.variables, metaObj.global, 0]);
    });

    it('second session', async () => {
      const { services, context, conv } = generateFakes();

      const contextManager = new InitializeManager(services as any, null as any);

      await contextManager.build(context as any, conv as any);

      expect(context.storage.get.args[0]).to.eql([S.SESSIONS]);
      expect(context.storage.produce.callCount).to.eql(1);
    });

    it('meta repeat null', async () => {
      const { services, context, conv, metaObj } = generateFakes();

      metaObj.repeat = null as any;
      context.fetchMetadata = sinon.stub().resolves(metaObj);

      const contextManager = new InitializeManager(services as any, null as any);

      await contextManager.build(context as any, conv as any);

      expect(context.storage.set.args[2]).to.eql([S.REPEAT, 100]);
    });

    describe('restart logic', () => {
      describe('shouldRestart', () => {
        it('stack empty', async () => {
          const { services, context, conv, metaObj } = generateFakes();

          context.stack.isEmpty = sinon.stub().returns(true);

          const contextManager = new InitializeManager(services as any, null as any);

          await contextManager.build(context as any, conv as any);

          expect(context.stack.flush.callCount).to.eql(1);
          expect(services.utils.client.Frame.args[0]).to.eql([{ diagramID: metaObj.diagram }]);
          expect(context.stack.push.callCount).to.eql(1);
        });

        it('meta restart', async () => {
          const { services, context, conv, metaObj } = generateFakes();

          context.stack.isEmpty = sinon.stub().returns(false);
          metaObj.restart = true;
          context.fetchMetadata = sinon.stub().resolves(metaObj);

          const contextManager = new InitializeManager(services as any, null as any);

          await contextManager.build(context as any, conv as any);

          expect(context.stack.flush.callCount).to.eql(1);
          expect(services.utils.client.Frame.args[0]).to.eql([{ diagramID: metaObj.diagram }]);
          expect(context.stack.push.callCount).to.eql(1);
        });

        it('resume var false', async () => {
          const { services, context, conv, metaObj } = generateFakes();

          context.stack.isEmpty = sinon.stub().returns(false);
          metaObj.restart = false;
          context.variables.get = sinon.stub().returns({ resume: false });

          context.fetchMetadata = sinon.stub().resolves(metaObj);

          const contextManager = new InitializeManager(services as any, null as any);

          await contextManager.build(context as any, conv as any);

          expect(context.stack.flush.callCount).to.eql(1);
          expect(services.utils.client.Frame.args[0]).to.eql([{ diagramID: metaObj.diagram }]);
          expect(context.stack.push.callCount).to.eql(1);
        });
      });

      describe('resume prompt', () => {
        it('resume stack 0', async () => {
          const { services, context, conv, metaObj, topStorage, resumeFrame } = generateFakes();

          context.stack.isEmpty = sinon.stub().returns(false);
          context.stack.getFrames = sinon.stub().returns([]);
          metaObj.restart = false;
          context.variables.get = sinon.stub().returns({ resume: true });
          metaObj.resume_prompt = { foo: 'bar' } as any;

          context.fetchMetadata = sinon.stub().resolves(metaObj);

          const contextManager = new InitializeManager(services as any, null as any);

          await contextManager.build(context as any, conv as any);

          expect(topStorage.set.args[0]).to.eql([F.CALLED_COMMAND, true]);
          expect(services.utils.resume.createResumeFrame.args[0]).to.eql([metaObj.resume_prompt]);
          expect(context.stack.push.args[0]).to.eql([resumeFrame]);
        });

        it('resume stack > 0', async () => {
          const { services, context, conv, metaObj, topStorage, resumeFrame } = generateFakes();

          context.stack.isEmpty = sinon.stub().returns(false);
          context.stack.getFrames = sinon
            .stub()
            .returns([
              { getDiagramID: () => false },
              { getDiagramID: () => false },
              { getDiagramID: () => services.utils.resume.RESUME_DIAGRAM_ID },
              { getDiagramID: () => false },
            ]);
          metaObj.restart = false;
          context.variables.get = sinon.stub().returns({ resume: true });
          metaObj.resume_prompt = { foo: 'bar' } as any;

          context.fetchMetadata = sinon.stub().resolves(metaObj);

          const contextManager = new InitializeManager(services as any, null as any);

          await contextManager.build(context as any, conv as any);

          expect(topStorage.set.args[0]).to.eql([F.CALLED_COMMAND, true]);
          expect(context.stack.popTo.args[0]).to.eql([2]);
          expect(services.utils.resume.createResumeFrame.args[0]).to.eql([metaObj.resume_prompt]);
          expect(context.stack.push.args[0]).to.eql([resumeFrame]);
        });
      });

      describe('else', () => {
        it('no last speak', async () => {
          const { services, context, conv, metaObj, topStorage } = generateFakes();

          metaObj.restart = false;
          context.fetchMetadata = sinon.stub().resolves(metaObj);
          topStorage.get = sinon.stub().returns(null);

          const contextManager = new InitializeManager(services as any, null as any);

          await contextManager.build(context as any, conv as any);

          expect(topStorage.delete.args[0]).to.eql([F.CALLED_COMMAND]);
          expect(topStorage.get.args[0]).to.eql([F.SPEAK]);
          expect(context.storage.set.args[3]).to.eql([S.OUTPUT, '']);
        });

        it('with last speak', async () => {
          const { services, context, conv, metaObj, topStorage } = generateFakes();

          metaObj.restart = false;
          context.fetchMetadata = sinon.stub().resolves(metaObj);
          const lastSpeak = 'random text';
          topStorage.get = sinon.stub().returns(lastSpeak);

          const contextManager = new InitializeManager(services as any, null as any);

          await contextManager.build(context as any, conv as any);

          expect(topStorage.delete.args[0]).to.eql([F.CALLED_COMMAND]);
          expect(topStorage.get.args[0]).to.eql([F.SPEAK]);
          expect(context.storage.set.args[3]).to.eql([S.OUTPUT, lastSpeak]);
        });
      });
    });
  });
});
