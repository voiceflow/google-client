import { SessionType } from '@voiceflow/general-types';
import { expect } from 'chai';
import _ from 'lodash';
import sinon from 'sinon';

import { F, S } from '@/lib/constants';
import InitializeManager from '@/lib/services/google/request/lifecycle/initialize';

const VERSION_ID = 'version-id';

describe('initializeManager unit tests', async () => {
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

      const session: any = { type: SessionType.RESTART };
      const metaObj = {
        variables: ['a', 'b', 'c'],
        platformData: {
          slots: [
            { name: 'd', type: 'x' },
            { name: 'e', type: 'y' },
          ],
          settings: {
            session,
          },
        },
        rootDiagramID: 'diagram-id',
      };

      const topStorage = {
        set: sinon.stub(),
        delete: sinon.stub(),
        get: sinon.stub().returns(null),
      };

      const runtime = {
        api: {
          getVersion: sinon.stub().resolves(metaObj),
        },
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
        getVersionID: sinon.stub().returns(VERSION_ID),
      };

      const conv = {
        user: {
          locale: 'en',
          storage: {},
        },
        surface: {
          capabilities: 'c',
        },
      };

      return {
        randomUserId,
        resumeFrame,
        services,
        metaObj,
        runtime,
        conv,
        topStorage,
      };
    };

    it('first session', async () => {
      const { randomUserId, services, metaObj, runtime, conv } = generateFakes();

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

      runtime.storage.get = storageGet;

      const runtimeClientManager = new InitializeManager(services as any, null as any);

      await runtimeClientManager.build(runtime as any, conv as any);

      expect(runtime.storage.get.args[0]).to.eql([S.SESSIONS]);
      expect(runtime.storage.set.args[0]).to.eql([S.SESSIONS, 1]);
      expect(runtime.storage.set.args[1]).to.eql([S.LOCALE, conv.user.locale]);
      expect(services.uuid4.callCount).to.eql(1);
      expect(runtime.storage.set.args[2]).to.eql([S.USER, randomUserId]);
      expect(runtime.variables.merge.args[0]).to.eql([
        {
          timestamp: 0,
          locale,
          user_id: userId,
          sessions: 1,
          platform: 'google',
          [InitializeManager.VAR_VF]: {
            events: [],
            capabilities: 'c',
          },
        },
      ]);
      expect(services.utils.client.Store.initialize.args[0]).to.eql([runtime.variables, metaObj.variables, 0]);
      expect(services.utils.client.Store.initialize.args[1]).to.eql([runtime.variables, metaObj.platformData.slots.map(({ name }) => name), 0]);
    });

    it('second session', async () => {
      // existing session and userId
      const { services, runtime, conv } = generateFakes();

      const runtimeClientManager = new InitializeManager(services as any, null as any);

      const oldUserId = 'old-id';
      _.set(conv, 'user.storage.userId', oldUserId);

      await runtimeClientManager.build(runtime as any, conv as any);

      expect(runtime.storage.get.args[0]).to.eql([S.SESSIONS]);
      expect(runtime.storage.produce.callCount).to.eql(1);

      const fn = runtime.storage.produce.args[0][0];
      const draft = {
        [S.SESSIONS]: 1,
      };

      fn(draft);

      expect(draft[S.SESSIONS]).to.eql(2);

      expect(runtime.storage.set.args[1]).to.eql([S.USER, oldUserId]);
    });

    describe('restart logic', () => {
      describe('shouldRestart', () => {
        it('stack empty', async () => {
          const { services, runtime, conv, metaObj } = generateFakes();

          runtime.stack.isEmpty = sinon.stub().returns(true);

          const runtimeClientManager = new InitializeManager(services as any, null as any);

          await runtimeClientManager.build(runtime as any, conv as any);

          expect(runtime.stack.flush.callCount).to.eql(1);
          expect(services.utils.client.Frame.args[0]).to.eql([{ programID: metaObj.rootDiagramID }]);
          expect(runtime.stack.push.callCount).to.eql(1);
        });

        it('meta restart', async () => {
          const { services, runtime, conv, metaObj } = generateFakes();

          runtime.stack.isEmpty = sinon.stub().returns(false);
          metaObj.platformData.settings.session = { type: SessionType.RESTART };
          runtime.api.getVersion = sinon.stub().resolves(metaObj);

          const runtimeClientManager = new InitializeManager(services as any, null as any);

          await runtimeClientManager.build(runtime as any, conv as any);

          expect(runtime.stack.flush.callCount).to.eql(1);
          expect(services.utils.client.Frame.args[0]).to.eql([{ programID: metaObj.rootDiagramID }]);
          expect(runtime.stack.push.callCount).to.eql(1);
        });

        it('resume var false', async () => {
          const { services, runtime, conv, metaObj } = generateFakes();

          runtime.stack.isEmpty = sinon.stub().returns(false);
          metaObj.platformData.settings.session = { type: SessionType.RESUME };
          runtime.variables.get = sinon.stub().returns({ resume: false });

          runtime.api.getVersion = sinon.stub().resolves(metaObj);

          const runtimeClientManager = new InitializeManager(services as any, null as any);

          await runtimeClientManager.build(runtime as any, conv as any);

          expect(runtime.stack.flush.callCount).to.eql(1);
          expect(services.utils.client.Frame.args[0]).to.eql([{ programID: metaObj.rootDiagramID }]);
          expect(runtime.stack.push.callCount).to.eql(1);
        });
      });

      describe('resume prompt', () => {
        it('resume stack 0', async () => {
          const { services, runtime, conv, metaObj, topStorage, resumeFrame } = generateFakes();

          runtime.stack.isEmpty = sinon.stub().returns(false);
          runtime.stack.getFrames = sinon.stub().returns([]);
          const session = { type: SessionType.RESUME, resume: { foo: 'bar' }, follow: 'test' };
          metaObj.platformData.settings.session = session;
          runtime.variables.get = sinon.stub().returns({ resume: true });

          runtime.api.getVersion = sinon.stub().resolves(metaObj);

          const runtimeClientManager = new InitializeManager(services as any, null as any);

          await runtimeClientManager.build(runtime as any, conv as any);

          expect(topStorage.set.args[0]).to.eql([F.CALLED_COMMAND, true]);
          expect(services.utils.resume.createResumeFrame.args[0]).to.eql([session.resume, session.follow]);
          expect(runtime.stack.push.args[0]).to.eql([resumeFrame]);
        });

        it('resume stack > 0', async () => {
          const { services, runtime, conv, metaObj, topStorage, resumeFrame } = generateFakes();

          runtime.stack.isEmpty = sinon.stub().returns(false);
          runtime.stack.getFrames = sinon
            .stub()
            .returns([
              { getProgramID: () => false },
              { getProgramID: () => false },
              { getProgramID: () => services.utils.resume.RESUME_DIAGRAM_ID },
              { getProgramID: () => false },
            ]);
          const session = { type: SessionType.RESUME, resume: { foo: 'bar' }, follow: null };
          metaObj.platformData.settings.session = session;
          runtime.variables.get = sinon.stub().returns({ resume: true });

          runtime.api.getVersion = sinon.stub().resolves(metaObj);

          const runtimeClientManager = new InitializeManager(services as any, null as any);

          await runtimeClientManager.build(runtime as any, conv as any);

          expect(topStorage.set.args[0]).to.eql([F.CALLED_COMMAND, true]);
          expect(runtime.stack.popTo.args[0]).to.eql([2]);
          expect(services.utils.resume.createResumeFrame.args[0]).to.eql([session.resume, session.follow]);
          expect(runtime.stack.push.args[0]).to.eql([resumeFrame]);
        });
      });

      describe('else', () => {
        it('no last speak', async () => {
          const { services, runtime, conv, metaObj, topStorage } = generateFakes();

          metaObj.platformData.settings.session = { type: SessionType.RESUME };
          runtime.api.getVersion = sinon.stub().resolves(metaObj);
          topStorage.get = sinon.stub().returns(null);

          const runtimeClientManager = new InitializeManager(services as any, null as any);

          await runtimeClientManager.build(runtime as any, conv as any);

          expect(topStorage.delete.args[0]).to.eql([F.CALLED_COMMAND]);
          expect(topStorage.get.args[0]).to.eql([F.SPEAK]);
          expect(runtime.storage.set.args[2]).to.eql([S.OUTPUT, '']);
        });

        it('with last speak', async () => {
          const { services, runtime, conv, metaObj, topStorage } = generateFakes();

          metaObj.platformData.settings.session = { type: SessionType.RESUME };
          runtime.api.getVersion = sinon.stub().resolves(metaObj);
          const lastSpeak = 'random text';
          topStorage.get = sinon.stub().returns(lastSpeak);

          const runtimeClientManager = new InitializeManager(services as any, null as any);

          await runtimeClientManager.build(runtime as any, conv as any);

          expect(topStorage.delete.args[0]).to.eql([F.CALLED_COMMAND]);
          expect(topStorage.get.args[0]).to.eql([F.SPEAK]);
          expect(runtime.storage.set.args[2]).to.eql([S.OUTPUT, lastSpeak]);
        });
      });
    });
  });
});
