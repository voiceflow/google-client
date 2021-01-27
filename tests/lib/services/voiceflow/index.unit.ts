import { EventType } from '@voiceflow/runtime';
import { expect } from 'chai';
import sinon from 'sinon';

import { F, S } from '@/lib/constants';
import RuntimeManager from '@/lib/services/runtime';

describe('runtimeManager unit tests', async () => {
  afterEach(() => sinon.restore());

  describe('client', () => {
    const generateFakes = () => {
      const clientObj = {
        setEvent: sinon.stub(),
      };
      const services = {};
      const config = {
        VF_DATA_ENDPOINT: 'random-endpoint',
        VF_DATA_SECRET: 'random-secret',
        DATADOG_API_KEY: 'random-secret',
      };
      const utils = {
        resume: {
          ResumeDiagram: { foo: 'bar' },
          RESUME_DIAGRAM_ID: 'diagram-id',
        },
        Client: sinon.stub().returns(clientObj),
        HandlersMap: { v1: sinon.stub().returns([]) },
      };

      return {
        clientObj,
        services,
        config,
        utils,
      };
    };

    it('works correctly', async () => {
      const { clientObj, services, config, utils } = generateFakes();

      utils.HandlersMap = { ...utils.HandlersMap, v0: {} } as any;
      const client = RuntimeManager(services as any, config as any, 'v1', utils as any);

      expect(client).to.eql(clientObj);
      expect(clientObj.setEvent.callCount).to.eql(2);
      expect(clientObj.setEvent.args[0][0]).to.eql(EventType.frameDidFinish);
      expect(clientObj.setEvent.args[1][0]).to.eql(EventType.programWillFetch);
      expect(utils.HandlersMap.v1.callCount).to.eql(1);
      expect(utils.HandlersMap.v1.args[0][0]).to.eql(config);
    });

    describe('frameDidFinish', () => {
      it('no top frame', async () => {
        const { clientObj, services, config, utils } = generateFakes();

        RuntimeManager(services as any, config as any, 'v1', utils as any);

        const fn = clientObj.setEvent.args[0][1];

        const runtime = {
          stack: {
            top: sinon.stub().returns(null),
          },
        };

        fn({ runtime });

        expect(runtime.stack.top.callCount).to.eql(1);
      });

      it('called command false', async () => {
        const { clientObj, services, config, utils } = generateFakes();

        RuntimeManager(services as any, config as any, 'v1', utils as any);

        const fn = clientObj.setEvent.args[0][1];

        const storageTop = {
          get: sinon.stub().returns(false),
        };
        const runtime = {
          stack: {
            top: sinon.stub().returns({ storage: storageTop }),
          },
        };

        fn({ runtime });

        expect(storageTop.get.args[0]).to.eql([F.CALLED_COMMAND]);
      });

      it('called command true but no output', async () => {
        const { clientObj, services, config, utils } = generateFakes();

        RuntimeManager(services as any, config as any, 'v1', utils as any);

        const fn = clientObj.setEvent.args[0][1];

        const topStorageGet = sinon.stub();
        topStorageGet.withArgs(F.CALLED_COMMAND).returns(true);
        topStorageGet.withArgs(F.SPEAK).returns(null);

        const storageTop = {
          get: topStorageGet,
          delete: sinon.stub(),
        };
        const runtime = {
          stack: {
            top: sinon.stub().returns({ storage: storageTop }),
          },
        };

        fn({ runtime });

        expect(topStorageGet.args[0]).to.eql([F.CALLED_COMMAND]);
        expect(storageTop.delete.args[0]).to.eql([F.CALLED_COMMAND]);
        expect(topStorageGet.args[1]).to.eql([F.SPEAK]);
      });

      it('called command true with output', async () => {
        const { clientObj, services, config, utils } = generateFakes();

        RuntimeManager(services as any, config as any, 'v1', utils as any);

        const fn = clientObj.setEvent.args[0][1];

        const fSpeak = 'random output';
        const topStorageGet = sinon.stub();
        topStorageGet.withArgs(F.CALLED_COMMAND).returns(true);
        topStorageGet.withArgs(F.SPEAK).returns(fSpeak);

        const storageTop = {
          get: topStorageGet,
          delete: sinon.stub(),
        };
        const runtime = {
          stack: {
            top: sinon.stub().returns({ storage: storageTop }),
          },
          storage: {
            produce: sinon.stub(),
          },
        };

        fn({ runtime });

        expect(topStorageGet.args[0]).to.eql([F.CALLED_COMMAND]);
        expect(storageTop.delete.args[0]).to.eql([F.CALLED_COMMAND]);
        expect(topStorageGet.args[1]).to.eql([F.SPEAK]);

        const fn2 = runtime.storage.produce.args[0][0];

        const initialDraft = 'initial';
        const draft = {
          [S.OUTPUT]: initialDraft,
        };

        fn2(draft);

        expect(draft[S.OUTPUT]).to.eql(initialDraft + fSpeak);
      });
    });

    describe('programWillFetch', () => {
      it('programID is eql to RESUME_DIAGRAM_ID', async () => {
        const { clientObj, services, config, utils } = generateFakes();

        utils.resume.RESUME_DIAGRAM_ID = 'different-id';

        RuntimeManager(services as any, config as any, 'v1', utils as any);

        const fn = clientObj.setEvent.args[1][1];

        const programID = 'diagram-id';
        const override = sinon.stub();

        fn({ programID, override });

        expect(override.callCount).to.eql(0);
      });

      it('programID is not eql to RESUME_DIAGRAM_ID', async () => {
        const { clientObj, services, config, utils } = generateFakes();

        utils.resume.RESUME_DIAGRAM_ID = 'diagram-id';

        RuntimeManager(services as any, config as any, 'v1', utils as any);

        const fn = clientObj.setEvent.args[1][1];

        const programID = 'diagram-id';
        const override = sinon.stub();

        fn({ programID, override });

        expect(override.args[0]).to.eql([utils.resume.ResumeDiagram]);
      });
    });
  });
});
